import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { booksRef, genreFollowersRef, genreRef } from '../../config/firebase';
import icon from '../../config/icons';
import { genres } from '../../config/lists';
import { screenSize as _screenSize, app, denormURL, handleFirestoreError, isScrollable, normURL, translateURL } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/genre.css';
import Cover from '../cover';
import Genres from '../genres';
import MinifiableText from '../minifiableText';
import PaginationControls from '../paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from '../skeletons';
import Bubbles from './bubbles';

const unsub = {
  genreFollowersFetch: null
};
const limit = 28;

const skltnStyle = { display: 'inline-block', marginTop: '1.15em', };

const Genre = () => {
  const { isAuth, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [count, setCount] = useState(0);
  const [coverview, setCoverview] = useState(true);
  const [desc, setDesc] = useState(true);
  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(null);
  const [genre, setGenre] = useState(null);
  const [items, setItems] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(true);
  const [orderByIndex, setOrderByIndex] = useState(0);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [page, setPage] = useState(1);
  const [screenSize, setScreenSize] = useState(_screenSize());

  const { t } = useTranslation(['common']);

  const is = useRef(true);

  const { gid } = useParams();

  const item = useMemo(() => genres.find(({ name }) => gid === normURL(name)), [gid]);

  useEffect(() => {
    const updateScreenSize = () => {
      if (is.current) setScreenSize(_screenSize());
    };

    window.addEventListener('resize', updateScreenSize);

    return () => {
      is.current = false;
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const fetchFollowers = useCallback(() => {
    if (!gid || !user) return;

    const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();
    unsub.genreFollowersFetch = genreFollowersRef(id).onSnapshot(snap => {
      if (!snap.empty) {
        const followers = [];
        snap.forEach(follower => followers.push(follower.data()));
        setFollow(user && followers.filter(follower => follower.uid === user.uid).length > 0);
        setFollowers(followers);
      } else {
        setFollow(false);
        setFollowers(null);
      }
    });

    return () => {
      unsub.genreFollowersFetch && unsub.genreFollowersFetch();
    };
  }, [gid, user]);

  const fetchGenre = useCallback(() => {
    if (!gid) return;

    if (is.current) {
      setLoadingGenre(true);
      setLoading(true);
      setItems(null);
    }

    // const id = normURL(item.name);
    const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();

    genreRef(id).get().then(snap => {
      if (snap.exists) {
        if (is.current) {
          setGenre(snap.data());
          setLoadingGenre(false);
        }
      }
    }).catch(err => {
      // setLoadingGenre(false);
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }, [gid, openSnackbar]);

  const orderBy = useMemo(() => ([
    { type: 'rating_num', label: t('RATING') },
    { type: 'title', label: t('TITLE') }
  ]), [t]);

  const fetch = useCallback(() => {
    if (!item) return;

    const ref = booksRef.where('genres', 'array-contains', denormURL(item.name));

    ref.get().then(fullSnap => {
      if (!fullSnap.empty) {
        if (is.current) setCount(fullSnap.docs.length);
        ref.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
          if (!snap.empty) {
            const items = [];
            snap.forEach(item => items.push(item.data()));
            // console.log(items);
            if (is.current) {
              setItems(items);
              setLastVisible(snap.docs[snap.docs.length-1]);
              setPage(1);
            }
          } else if (is.current) {
            setCount(0);
            setItems(null);
            setPage(1);
          }
        }).catch(err => {
          openSnackbar(handleFirestoreError(err), 'error');
        }).finally(() => {
          if (is.current) setLoading(false);
        });
      } else if (is.current) {
        setFollow(false);
        setFollowers(null);
        // setGenre(null);
        setLoading(false);
      }
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  }, [desc, item, openSnackbar, orderBy, orderByIndex]);

  useEffect(() => {
    fetchGenre();
  }, [fetchGenre]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const fetchNext = () => {
    if (!item) return;
    if (is.current) setLoading(true);

    const ref = booksRef.where('genres', 'array-contains', item.name);

    ref.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setPage((page * limit) > count ? page : page + 1);
          setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
        }
      } else if (is.current) {
        setItems(null);
        setPage(null);
        setLastVisible(null);
      }
    }).catch(err => {
      if (is.current) openSnackbar(handleFirestoreError(err), 'error');
    }).finally(() => {
      if (is.current) setLoading(false);
    });
  };

  const onChangeOrderBy = (e, i) => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
    setPage(1);
  };

  const onToggleDesc = () => setDesc(prev => !prev);

  const onToggleView = () => setCoverview(prev => !prev);

  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);

  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);

  const onFollow = () => {
    if (!gid) return;
    const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();

    if (follow) {
      // console.log('unfollow', gid);
      genreFollowersRef(id).doc(user.uid).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      // console.log('follow', gid);
      genreFollowersRef(id).doc(user.uid).set({
        gid: id,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: Date.now()
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const isMini = useMemo(() => isScrollable(screenSize), [screenSize]);

  const isTextMinified = useMemo(() => ['xs', 'sm', 'md'].some(m => m === screenSize), [screenSize]);

  const covers = useMemo(() => items?.map((item, i) => (
    <Link key={item.bid} to={`/book/${item.bid}/${normURL(item.title)}`}>
      <Cover book={item} index={i} page={page} />
    </Link>
  )), [items, page]);

  const orderByOptions = useMemo(() => orderBy.map((option, i) => (
    <MenuItem
      key={option.type}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={e => onChangeOrderBy(e, i)}>
      {option.label}
    </MenuItem>
  )), [orderBy, orderByIndex]);

  const title = useMemo(() => t(`lists:GENRE_${translateURL(item?.canonical)}`), [item?.canonical, t]);

  const seo = useMemo(() => ({
    canonical_name: item?.canonical,
    description: `Scopri su ${app.name} i migliori libri di genere ${title.toLowerCase()}: nuove uscite e best seller`,
    image: null,
    title: `Libri di genere ${title}`,
    url: `${app.url}/genre/${gid}`
  }), [item, gid, title]);

  const cardStyle = useMemo(() => ({ borderTop: `4px solid ${item ? item.color : 'rgba(0, 0, 0, .1)'}`, }), [item]);

  if (!gid) return <Navigate to='/genres' />;

  return (
    <div className="container" id="genreComponent" ref={is}>
      <Helmet>
        <title>{app.name} | {title || t('PAGE_GENRE')}</title>
        <link rel="canonical" href={`${app.url}/genres`} />
        <meta name="description" content={seo.description} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="books.genre" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:url" content={seo.url} />
        {seo.image && <meta property="og:image" content={seo.image} />}
        <meta property="books:canonical_name" content={seo.canonical_name} />
      </Helmet>
      <div className="card dark" style={cardStyle}>
        <div className="row">
          <div className="col">
            <h2 className="title">
              <span className="primary-text hide-sm">{t('PAGE_GENRE')}:</span> {title}
            </h2>
          </div>
          <div className="col-auto text-right">
            <Link to="/genres" className="btn sm flat">
              {t('ACTION_SHOW_ALL')}
            </Link>
          </div>
        </div>
        <Genres scrollable={isMini} />
        {loadingGenre ? (
          <div className="skltn three rows" style={skltnStyle} />
        ) : (
          <div className="info-row text">
            <MinifiableText
              text={genre?.description}
              maxChars={isTextMinified ? 300 : 500}
              defaultMinified={isTextMinified}
            />
          </div>
        )}
        {isAuth && (
          <div className="info-row">
            <button
              type="button"
              className={classnames('btn', 'sm', follow ? 'success error-on-hover' : 'primary')}
              disabled={!isEditor}
              onClick={onFollow}>
              {follow ? (
                <>
                  <span className="hide-on-hover">{icon.check} {t('ACTION_FOLLOW')}</span>
                  <span className="show-on-hover">{t('ACTION_STOP_FOLLOWING')}</span>
                </>
              ) : <span>{icon.plus} {t('ACTION_FOLLOW')}</span> }
            </button>
            <div className="counter last inline">
              <Bubbles limit={3} items={followers} />
            </div>
          </div>
        )}
      </div>

      {(loading && !items) || items ? (
        <div className="card light">
          <div className="shelf">
            <div className="collection hoverable-items">
              <div className="head nav">
                <div className="row">
                  <div className="col">
                    <button
                      type="button"
                      className="btn sm flat counter"
                      disabled={!items}
                      title={coverview ? 'Stack view' : 'Cover view'}
                      onClick={onToggleView}>
                      {coverview ? icon.viewSequential : icon.viewGrid}
                    </button>
                    <span className="counter">
                      {t('BOOKS_COUNT', { count: items?.length || 0 })} {items && count > items.length ? `di ${count}` : ''}
                    </span>
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn sm flat counter"
                      disabled={!items}
                      onClick={onOpenOrderMenu}>
                      <span className="hide-xs">{t('SORT_BY')}</span> {orderBy[orderByIndex].label}
                    </button>
                    <button
                      type="button"
                      className={classnames('btn', 'sm', 'flat', 'counter', 'icon', desc ? 'desc' : 'asc')}
                      disabled={!items}
                      title={t(desc ? 'ASCENDING' : 'DESCENDING')}
                      onClick={onToggleDesc}>
                      {icon.arrowDown}
                    </button>
                    <Menu
                      className="dropdown-menu"
                      anchorEl={orderMenuAnchorEl}
                      open={Boolean(orderMenuAnchorEl)}
                      onClose={onCloseOrderMenu}>
                      {orderByOptions}
                    </Menu>
                  </div>
                </div>
              </div>
              {loading && !items ? !coverview ? skltn_shelfStack : skltn_shelfRow : (
                <div className={classnames('shelf-row books-per-row-4', coverview ? 'coverview' : 'stacked')}>
                  {covers}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : !items && (
        <div className="info-row empty text-center pad-v">
          <p>{t('EMPTY_LIST')}</p>
          <Link to="/new-book?search=genre" className="btn primary rounded">
            {t('ACTION_ADD_BOOK')}
          </Link>
        </div>
      )}

      {genre && count > 0 && items?.length < count && (
        <PaginationControls
          count={count}
          fetch={fetchNext}
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      )}
    </div>
  );
};

export default Genre;