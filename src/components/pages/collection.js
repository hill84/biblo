
import { Tooltip } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { lazy, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { genres } from '../../config/lists';
import { app, denormURL, handleFirestoreError, hasRole, isTouchDevice, normalizeString, normURL, screenSize, timestamp, truncateString } from '../../config/shared';
import { historyType, locationType, matchType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import BookCollection from '../bookCollection';
import MinifiableText from '../minifiableText';
import Bubbles from './bubbles';

const NoMatch = lazy(() => import('../noMatch'));

const Collection = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { history, location, match } = props;
  const [collection, setCollection] = useState(null);
  const [collections, setCollections] = useState(null);
  const [desc, setDesc] = useState(false);
  const [filterByName, setFilterByName] = useState(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [follow, setFollow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [_screenSize, setScreenSize] = useState(screenSize());
  const is = useRef(true);

  const { cid } = match.params;

  const uid = user && user.uid;

  const fetch = useCallback(() => {
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
          setLoading(false);
        }
      } else if (is.current) {
        setCollection(null);
        setFollowers(null);
        setFollow(false);
        setLoading(false);
      }
    }).catch(err => {
      setLoading(false);
      openSnackbar(handleFirestoreError(err), 'error');
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
    }
  }, [cid, desc, filterByName, openSnackbar, uid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

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

  const onFollow = useCallback(() => {
    if (uid) {
      if (follow) {
        collectionFollowersRef(denormURL(cid)).doc(uid).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else {
        collectionFollowersRef(denormURL(cid)).doc(uid).set({
          uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          timestamp
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
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

  const isScrollable = isTouchDevice() || _screenSize === 'xs' || _screenSize === 'sm';
  
  const isEditor = hasRole(user, 'editor');

  const filterByOptions = genres.map(option => (
    <MenuItem
      key={option.id}
      selected={option.name === filterByName}
      onClick={e => onChangeFilterBy(e, option.name)}>
      {option.name}
    </MenuItem>
  ));

  if (!loading && !collection) {
    return <NoMatch title="Collezione non trovata" history={history} location={location} />
  }

  return (
    <div id="CollectionComponent" className="container" ref={is}>
      <Helmet>
        <title>{app.name} | {collection ? collection.title : 'Collezione'}</title>
        <link rel="canonical" href={`${app.url}/collections`} />
        <meta name="description" content={collection && collection.description ? truncateString(collection.description, 155) : app.desc} />
      </Helmet>
      <div className="row">
        <div className="col">
            <div className="card dark collection-profile">
              <h2>{denormURL(cid)}</h2>
              {loading ? <div className="skltn rows" /> : 
                <>
                  <div className="info-row description">
                    <MinifiableText text={collection.description} maxChars={500} />
                  </div>
                  {user && isEditor && (
                    <div className="info-row">
                      <button 
                        type="button" 
                        className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`} 
                        onClick={onFollow} 
                        disabled={!user || !isEditor}>
                        {follow ? 
                          <>
                            <span className="hide-on-hover">{icon.check} Segui</span>
                            <span className="show-on-hover">Smetti</span>
                          </> 
                        : <span>{icon.plus} Segui</span> }
                      </button>
                      <div className="counter last inline">
                        <Bubbles limit={3} items={followers} />
                      </div>
                    </div>
                  )}
                </>
              }
            </div>
            
            <div className="card dark text-left">
              <div className="head nav" role="navigation">
                <span className="counter last title">Altre collezioni</span>
                <div className="pull-right">
                  {filterByName &&
                  <Tooltip title="Resetta i filtri">
                    <button
                      type="button"
                      className="btn icon sm flat rounded counter"
                      onClick={onResetFilters}>
                      {icon.close}
                    </button>
                  </Tooltip>
                  }
                  <button 
                    type="button"
                    className="btn sm flat rounded counter"
                    onClick={onOpenFilterMenu}>
                    {filterByName || 'Filtra per genere'}
                  </button>
                  <Menu 
                    className="dropdown-menu"
                    anchorEl={filterMenuAnchorEl} 
                    open={Boolean(filterMenuAnchorEl)} 
                    onClose={onCloseFilterMenu}>
                    {filterByOptions}
                  </Menu>
                  <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                    <button
                      type="button"
                      className={`btn sm icon flat rounded counter ${desc ? 'desc' : 'asc'}`}
                      onClick={onToggleDesc}>
                      {icon.arrowDown}
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className={`badges table ${isScrollable ? 'scrollable' : 'fullview'} ${filterByName ? 'stacked' : ''}`}>
                <div className="content">
                  {loadingCollections ? <div className="skltn rows" /> : collections ? collections.map(collection => 
                    <Link 
                      to={`/collection/${normURL(collection.title)}`} 
                      key={normalizeString(collection.title)} 
                      className="badge">
                      {collection.title}{filterByName && <span className="pull-right">{collection.books_num} libri</span>}
                    </Link>
                  ) : (
                    <div className="empty text-center">
                      <div className="counter last">Nessuna collezione</div>
                      <button type="button" className="btn rounded flat" onClick={onResetFilters}>Resetta i filtri</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ul className="nolist inline-items info-row hide-md">
              <li className="counter"><Link to="/collections">Collezioni</Link></li>
              <li className="counter"><Link to="/genres">Generi</Link></li>
              <li className="counter"><Link to="/authors">Autori</Link></li>
            </ul>
        </div>
        <div className="col-md-6">
          <div className="card light">
            <BookCollection cid={denormURL(cid)} pagination={false} booksPerRow={1} stacked />
          </div>
        </div>
      </div>
    </div>
  );
};

Collection.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType
}

Collection.defaultProps = {
  history: null,
  location: null,
  match: null
}
 
export default Collection;