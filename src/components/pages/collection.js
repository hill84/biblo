
import { Tooltip } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import { lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { genres } from '../../config/lists';
import { screenSize as _screenSize, app, denormURL, handleFirestoreError, isScrollable, normURL, normalizeString, truncateString } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import BookCollection from '../bookCollection';
import MinifiableText from '../minifiableText';
import Bubbles from './bubbles';

const NoMatch = lazy(() => import('../noMatch'));

const Collection = () => {
  const { isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [collection, setCollection] = useState(null);
  const [collections, setCollections] = useState(null);
  const [desc, setDesc] = useState(false);
  const [filterByName, setFilterByName] = useState(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [follow, setFollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [screenSize, setScreenSize] = useState(_screenSize());

  const { t } = useTranslation(['common']);

  const is = useRef(true);

  const { cid } = useParams();

  const uid = user?.uid;

  const fetch = useCallback(() => {
    if (!cid) return;

    let unsubCollectionFollowersFetch;

    collectionRef(denormURL(cid)).get().then(snap => {
      if (!snap.empty) {
        unsubCollectionFollowersFetch = collectionFollowersRef(denormURL(cid)).onSnapshot(snap => {
          if (!snap.empty) {
            const followers = [];
            snap.forEach(follower => followers.push(follower.data()));
            setFollowers(followers);
            setFollow(uid && followers.filter(follower => follower.uid === uid).length > 0);
          } else {
            setFollowers(null);
            setFollow(false);
          }
        });
        if (is.current) {
          setCollection(snap.data());
        }
      } else if (is.current) {
        setCollection(null);
        setFollowers(null);
        setFollow(false);
      }
    }).catch(err => {
      openSnackbar(handleFirestoreError(err), 'error');
    }).finally(() => {
      if (is.current) setLoading(false);
    });

    const filter = filterByName && genres.filter(item => item.name === filterByName)[0].name;
    const fRef = filterByName ? collectionsRef.where('genres', 'array-contains', filter) : collectionsRef;

    fRef.orderBy('title', desc ? 'desc' : 'asc').get().then(snap => {
      if (!snap.empty) {
        const collections = [];
        snap.forEach(collection => collection.id !== (denormURL(cid)) && collections.push(collection.data()));
        if (is.current) {
          setCollections(collections);
          setLoadingCollections(false);
        }
      } else if (is.current) {
        setCollections(null);
        setLoadingCollections(false);
      }
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    return () => {
      unsubCollectionFollowersFetch && unsubCollectionFollowersFetch();
    };
  }, [cid, desc, filterByName, openSnackbar, uid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  const onFollow = useCallback(() => {
    if (!cid || !uid) return;
    if (follow) {
      collectionFollowersRef(denormURL(cid)).doc(uid).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      collectionFollowersRef(denormURL(cid)).doc(uid).set({
        cid: denormURL(cid),
        uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: Date.now()
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  }, [cid, follow, openSnackbar, uid, user]);

  const onToggleDesc = () => {
    if (is.current) setDesc(!desc);
  };

  const onChangeFilterBy = (e, option) => {
    if (is.current) {
      setFilterByName(option);
      setFilterMenuAnchorEl(null);
    }
  };

  const onOpenFilterMenu = e => {
    e.persist();
    if (is.current) setFilterMenuAnchorEl(e.currentTarget);
  };

  const onCloseFilterMenu = () => {
    if (is.current) setFilterMenuAnchorEl(null);
  };

  const onResetFilters = () => {
    if (is.current) {
      setFilterByName(null);
      setFilterMenuAnchorEl(null);
    }
  };

  const isMini = useMemo(() => isScrollable(screenSize), [screenSize]);

  const filterByOptions = genres.map(option => (
    <MenuItem
      key={option.id}
      selected={option.name === filterByName}
      onClick={e => onChangeFilterBy(e, option.name)}>
      {option.name}
    </MenuItem>
  ));

  if (!cid || (!loading && !collection)) return (
    <NoMatch title='Collezione non trovata' />
  );

  return (
    <div id='CollectionComponent' className='container' ref={is}>
      <Helmet>
        <title>{app.name} | {collection ? collection.title : 'Collezione'}</title>
        <link rel='canonical' href={`${app.url}/collections`} />
        <meta name='description' content={collection?.description ? truncateString(collection.description, 155) : app.desc} />
      </Helmet>
      <div className='row'>
        <div className='col'>
          <div className='card dark collection-profile'>
            <h2>{denormURL(cid)}</h2>
            {loading ? <div className='skltn rows' /> :
              <>
                <div className='info-row description'>
                  <MinifiableText text={collection.description} maxChars={500} />
                </div>
                {user && isEditor && (
                  <div className='info-row'>
                    <button
                      type='button'
                      className={classnames('btn', 'sm', follow ? 'success error-on-hover' : 'primary')}
                      onClick={onFollow}
                      disabled={!user || !isEditor}>
                      {follow ? (
                        <>
                          <span className='hide-on-hover'>{icon.check} {t('ACTION_FOLLOW')}</span>
                          <span className='show-on-hover'>{t('ACTION_STOP_FOLLOWING')}</span>
                        </>
                      ) : (
                        <span>{icon.plus} {t('ACTION_FOLLOW')}</span>
                      )}
                    </button>
                    <div className='counter last inline'>
                      <Bubbles limit={3} items={followers} />
                    </div>
                  </div>
                )}
              </>
            }
          </div>

          <div className='card dark text-left'>
            <div className='head nav' role='navigation'>
              <span className='counter last title'>Altre collezioni</span>
              <div className='pull-right'>
                {filterByName &&
                <Tooltip title='Resetta i filtri'>
                  <button
                    type='button'
                    className='btn icon sm flat rounded counter'
                    onClick={onResetFilters}>
                    {icon.close}
                  </button>
                </Tooltip>
                }
                <button
                  type='button'
                  className='btn sm flat rounded counter'
                  onClick={onOpenFilterMenu}>
                  {filterByName || 'Filtra per genere'}
                </button>
                <Menu
                  className='dropdown-menu'
                  anchorEl={filterMenuAnchorEl}
                  open={Boolean(filterMenuAnchorEl)}
                  onClose={onCloseFilterMenu}>
                  {filterByOptions}
                </Menu>
                <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                  <button
                    type='button'
                    className={classnames('btn', 'sm', 'icon', 'flat', 'rounded', 'counter', desc ? 'desc' : 'asc')}
                    onClick={onToggleDesc}>
                    {icon.arrowDown}
                  </button>
                </Tooltip>
              </div>
            </div>
            <div className={classnames('badges', 'table', isMini ? 'scrollable' : 'fullview', { 'stacked': filterByName })}>
              <div className='content'>
                {loadingCollections ? <div className='skltn rows' /> : collections ? collections.map(collection =>
                  <Link
                    to={`/collection/${normURL(collection.title)}`}
                    key={normalizeString(collection.title)}
                    className='badge'>
                    {collection.title}{filterByName && <span className='pull-right'>{t('BOOKS_COUNT', { count: collection.books_num })}</span>}
                  </Link>
                ) : (
                  <div className='empty text-center'>
                    <div className='counter last'>{t('NO_COLLECTIONS')}</div>
                    <button type='button' className='btn rounded flat' onClick={onResetFilters}>Resetta i filtri</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <ul className='nolist inline-items info-row hide-md'>
            <li className='counter'><Link to='/collections'>{t('PAGE_COLLECTIONS')}</Link></li>
            <li className='counter'><Link to='/genres'>{t('PAGE_GENRES')}</Link></li>
            <li className='counter'><Link to='/authors'>{t('PAGE_AUTHORS')}</Link></li>
          </ul>
        </div>
        <div className='col-md-6'>
          <div className='card light'>
            <BookCollection cid={denormURL(cid)} pagination={false} booksPerRow={1} stacked />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;