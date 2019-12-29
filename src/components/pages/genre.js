import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { booksRef, genreFollowersRef, genreRef, isAuthenticated } from '../../config/firebase';
import icon from '../../config/icons';
import { genres } from '../../config/lists';
import { app, denormURL, handleFirestoreError, hasRole, isTouchDevice, normURL, screenSize } from '../../config/shared';
import { funcType, matchType } from '../../config/types';
import UserContext from '../../context/userContext';
import '../../css/genre.css';
import Cover from '../cover';
import Genres from '../genres';
import MinifiableText from '../minifiableText';
import PaginationControls from '../paginationControls';
import { skltn_shelfRow, skltn_shelfStack } from '../skeletons';
import Bubbles from './bubbles';

const limit = 28;
const orderBy = [ 
  { type: 'rating_num', label: 'Valutazione'}, 
  { type: 'title', label: 'Titolo'}
];
const skltnStyle = { display: 'inline-block', marginTop: '1.1em', };

const Genre = props => {
  const { user } = useContext(UserContext);
  const { match, openSnackbar } = props;
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
  const [_screenSize, setScreenSize] = useState(screenSize());
  const is = useRef(true);

  const { gid } = match.params;

  useEffect(() => {
    const updateScreenSize = () => {
      if (is.current) setScreenSize(screenSize());
    };

    window.addEventListener('resize', updateScreenSize);

    return () => {
      is.current = false;
      window.removeEventListener('resize', updateScreenSize);
    }
  }, []);

  const fetchFollowers = useCallback(() => {
    let unsubGenreFollowersFetch;
    if (user) {
      const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();
      unsubGenreFollowersFetch = genreFollowersRef(id).onSnapshot(snap => {
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
    }

    return () => {
      unsubGenreFollowersFetch && unsubGenreFollowersFetch();
    }
  }, [gid, user]);

  const fetchGenre = useCallback(() => {
    const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();

    if (is.current) {
      setLoadingGenre(true);
      setLoading(true);
      setItems(null);
    }

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

  const fetch = useCallback(() => {
    if (gid) {
      const ref = booksRef.where('genres', 'array-contains', denormURL(gid));

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
                setLoading(false);
                setPage(1);
              }
            } else if (is.current) {
              setCount(0);
              setItems(null);
              setLoading(false);
              setPage(1);
            }
          }).catch(err => {
            setLoading(false);
            openSnackbar(handleFirestoreError(err), 'error');
          });
        } else if (is.current) {
          setFollow(false);
          setFollowers(null);
          setGenre(null);
          // setLoading(false);
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn(`No gid`);
  }, [desc, gid, openSnackbar, orderByIndex]);

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
    if (gid) {
      if (is.current) setLoading(true);

      const ref = booksRef.where('genres', 'array-contains', denormURL(gid));

      ref.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
        if (!nextSnap.empty) {
          nextSnap.forEach(item => items.push(item.data()));
          if (is.current) {
            setItems(items);
            setLoading(false);
            setPage((page * limit) > count ? page : page + 1);
            setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
          }
        } else if (is.current) {
          setItems(null);
          setLoading(false);
          setPage(null);
          setLastVisible(null);
        }
      }).catch(err => {
        if (is.current) {
          setLoading(false);
          openSnackbar(handleFirestoreError(err), 'error');
        }
      });
    } else console.warn(`No gid`);
  }

  const onChangeOrderBy = (e, i) => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(null);
    setPage(1);
  }

  const onToggleDesc = () => setDesc(!desc);

  const onToggleView = () => setCoverview(!coverview);

  const onOpenOrderMenu = e => setOrderMenuAnchorEl(e.currentTarget);

  const onCloseOrderMenu = () => setOrderMenuAnchorEl(null);

  const onFollow = () => {
    const id = decodeURI(gid.replace(/_/g, '-')).toLowerCase();

    if (follow) {
      // console.log('unfollow', gid);
      genreFollowersRef(id).doc(user.uid).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      // console.log('follow', gid);
      genreFollowersRef(id).doc(user.uid).set({
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: (new Date()).getTime()
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const genreColor = useMemo(() => genres.filter(genre => genre.name === denormURL(match.params.gid))[0].color, [match]);
  
  const isScrollable = useMemo(() => isTouchDevice() || _screenSize === 'xs' || _screenSize === 'sm', [_screenSize]);
  
  const isTextMinified = useMemo(() => _screenSize === 'xs' || _screenSize === 'sm' || _screenSize === 'md', [_screenSize]);
  
  const isEditor = useMemo(() => hasRole(user, 'editor'), [user]);
  
  const covers = useMemo(() => items && items.map((item, i) => (
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
  )), [orderByIndex]);
  
  const title = useMemo(() => denormURL(match.params.gid), [match]);

  const seo = useMemo(() => ({
    canonical_name: genres.filter(genre => genre.name === title)[0].canonical,
    description: `Scopri su ${app.name} i migliori libri di genere ${title.toLowerCase()}: nuove uscite e best seller`,
    image: null,
    title: `Libri di genere ${title.toLowerCase()}`,
    url: `${app.url}/genre/${normURL(match.params.gid)}`
  }), [match, title]);
  
  const cardStyle = useMemo(() => ({ borderTop: `4px solid ${genreColor}`, }), [genreColor]);
  
  const linkStyle = useMemo(() => ({ color: !isScrollable ? 'white' : '', }), [isScrollable]);
  
  return (
    <div className="container" id="genreComponent" ref={is}>
      <Helmet>
        <title>{app.name} | {title || 'Genere'}</title>
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
              <span className="primary-text hide-sm">Genere:</span> {title}
            </h2>
          </div>
          <div className="col-auto text-right">
            <Link to="/genres" className="btn sm flat" style={linkStyle}>Vedi tutti</Link>
          </div>
        </div>
        <Genres scrollable={isScrollable} />
        {loadingGenre ? (
          <div className="skltn three rows" style={skltnStyle} /> 
        ) : genre && genre.description && (
          <div className="info-row text">
            <MinifiableText
              text={genre.description}
              maxChars={isTextMinified ? 300 : 500}
              defaultMinified={isTextMinified}
            />
          </div>
        )}
        {isAuthenticated() && (
          <div className="info-row">
            <button
              type="button"
              className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`}
              disabled={!isEditor}
              onClick={onFollow}>
              {follow ? (
                <>
                  <span className="hide-on-hover">{icon.check()} Segui</span>
                  <span className="show-on-hover">Smetti</span>
                </> 
              ) : <span>{icon.plus()} Segui</span> }
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
                      {coverview ? icon.viewSequential() : icon.viewGrid()}
                    </button>
                    <span className="counter">
                      {items ? items.length : 0} libr{items && items.length === 1 ? 'o' : 'i'} {items && count > items.length ? `di ${count}` : ''}
                    </span>
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn sm flat counter"
                      disabled={!items}
                      onClick={onOpenOrderMenu}>
                      <span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}
                    </button>
                    <button
                      type="button"
                      className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`}
                      disabled={!items}
                      title={desc ? 'Ascendente' : 'Discendente'}
                      onClick={onToggleDesc}>
                      {icon.arrowDown()}
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
                <div className={`shelf-row books-per-row-4 ${coverview ? 'coverview' : 'stacked'}`}>
                  {covers}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : !items && (
        <div className="info-row empty text-center pad-v">
          <p>Non ci sono ancora libri di questo genere</p>
          <Link to="/new-book?search=genre" className="btn primary rounded">Aggiungi libro</Link>
        </div>
      )}

      {genre && count > 0 && items && items.length < count &&
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      }
    </div>
  );
}

Genre.propTypes = {
  match: matchType,
  openSnackbar: funcType.isRequired
}

Genre.defaultProps = {
  match: null
}
 
export default Genre;