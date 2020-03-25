import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';
import React, { lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import { followersRef, followingsRef, notesRef, userChallenges, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { dashboardTabs as tabs, profileKeys } from '../../config/lists';
import { app, calcAge, capitalize, getInitials, isTouchDevice, joinToLowerCase, normURL, screenSize as _screenSize, timeSince, truncateString } from '../../config/shared';
import { historyType, locationType, matchType, objectType, stringType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/dashboard.css';
import ReadingStats from '../readingStats';
import Reviews from '../reviews';
// import PaginationControls from '../paginationControls'; // TODO
import Shelf from '../shelf';

const NoMatch = lazy(() => import('../noMatch'));

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

const tabDir = null;

const unsub = {
  userFetch: null,
  collectionFetch: null,
  luidFollowersFetch: null,
  luidFollowingsFetch: null,
  uidFollowersFetch: null,
  uidFollowingsFetch: null
};

const skltnStyle = { margin: '.4em 0', };

const max = {
  followings: {
    premium: 50,
    standard: 10
  }
};

const Dashboard = props => {
  const { isAdmin, isAuth, isPremium, user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar } = useContext(SnackbarContext);
  const { history, location, match } = props;
  const tab = match.params?.tab;
  const [duser, setDuser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [followers, setFollowers] = useState({});
  // const [followersPage, setFollowersPage] = useState(1);
  const [followings, setFollowings] = useState({});
  // const [followingsPage, setFollowingsPage] = useState(1);
  const [follow, setFollow] = useState(false);
  const [lfollowers, setLfollowers] = useState({});
  const [lfollowings, setLfollowings] = useState({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tabSelected, setTabSelected] = useState(tab ? tabs.indexOf(tab) !== -1 ? tabs.indexOf(tab) : 0 : 0);
  const [screenSize, setScreenSize] = useState(_screenSize());
  const is = useRef(true);

  const { uid } = match.params;
  const luid = useMemo(() => user?.uid, [user]);
  const isOwner = useMemo(() => luid === uid, [luid, uid]);

  useEffect(() => {
    const updateScreenSize = () => {
      if (is.current) setScreenSize(_screenSize());
    };
    
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      is.current = false;
      window.removeEventListener('resize', updateScreenSize);
      unsub.userFetch && unsub.userFetch();
    }
  }, []);

  const calcProgress = useCallback(user => {
    let count = 0;
    const keys = Object.keys(user).filter(item => profileKeys.includes(item));
    const tot = profileKeys.length;
    
    keys.forEach(i => { 
      // console.log(i + ': ' + typeof user[i] + ' - ' + user[i]);
      if (typeof user[i] === 'string') {
        if (user[i] !== '') count++ 
      } else if (Array.isArray(user[i])) {
        if (user[i].length > 0) count++ 
      } else count++
    });
    
    if (tot) return Number((100 / tot * count).toFixed(0));
    return 0;
  }, []);

  const fetchUser = useCallback(() => {
    if (uid) {
      if (luid === uid) {
        if (is.current) {
          setDuser(user);
          setProgress(calcProgress(user));
          setLoading(false);
        }
      } else {
        if (is.current) setLoading(true);
        unsub.userFetch = userRef(uid).onSnapshot(snap => {
          if (snap.exists) {
            setDuser(snap.data());
            setProgress(calcProgress(snap.data()));
          } else {
            setDuser(null);
            setProgress(0);
          }
          setLoading(false);
        });
      }
    }
  }, [calcProgress, luid, uid, user]);

  const fetchFollowers = useCallback(() => {
    if (uid) {
      unsub.uidFollowersFetch && unsub.uidFollowersFetch();
      unsub.uidFollowersFetch = followersRef(uid).onSnapshot(snap => {
        if (snap.exists) {
          setFollowers(snap.data());
          setFollow(luid ? Object.keys(snap.data()).indexOf(luid) > -1 : false);
        } else {
          setFollowers({});
          setFollow(false);
        }
      });
      if (isAuth) {
        if (luid && luid !== uid) {
          // console.log('fetching lfollowers');
          unsub.luidFollowersFetch && unsub.luidFollowersFetch();
          unsub.luidFollowersFetch = followersRef(luid).onSnapshot(snap => {
            if (snap.exists) {
              setLfollowers(snap.data());
            } else {
              setLfollowers({});
            }
          });
        }
      }
    }
	}, [isAuth, luid, uid]);

	const fetchFollowings = useCallback(() => {
    if (uid) {
      unsub.uidFollowingsFetch && unsub.uidFollowingsFetch();
      unsub.uidFollowingsFetch = followingsRef(uid).onSnapshot(snap => {
        if (snap.exists) {
          setFollowings(snap.data());
        } else {
          setFollowings({});
        }
      });
      
      if (luid && luid !== uid) {
        // console.log('fetching lfollowings');
        unsub.luidFollowingsFetch && unsub.luidFollowingsFetch();
        unsub.luidFollowingsFetch = followingsRef(luid).onSnapshot(snap => {
          if (snap.exists) {
            setLfollowings(snap.data());
          } else {
            setLfollowings({});
          }
        });
      }
    }
  }, [luid, uid]);

  const fetchUserChallenges = useCallback(() => {
		if (luid) {
      unsub.collectionFetch = userChallenges(luid).onSnapshot(snap => {
        if (!snap.empty) {
          const challenges = [];
          snap.forEach(doc => challenges.push(doc.data()));
          setChallenges(challenges);
        }
      });
    }
  }, [luid]);
  
  useEffect(() => {
    if (uid) {
      fetchUser();
      fetchFollowers();
      fetchFollowings();
      fetchUserChallenges();
    }
  }, [fetchUser, fetchFollowers, fetchFollowings, fetchUserChallenges, uid]);

  useEffect(() => {
    if (uid) {
      if (tabSelected === 0) {
        const newPath = `/dashboard/${uid}/${tabs[0]}`;
        if (history !== newPath) {
          history.replace(newPath, null);
        }
      }
    }
  }, [history, tabSelected, uid]);

  useEffect(() => {
    if (isOwner && !user?.photoURL) {
      const msg = <span>Non hai <span className="hide-sm">ancora caricato</span> una foto profilo.</span>;
      const action = <Link to="/profile" type="button" className="btn sm flat" onClick={closeSnackbar}>Aggiungila</Link>;
      setTimeout(() => {
        openSnackbar(msg, 'info', 6000, action);
      }, 3000);
    }
  }, [closeSnackbar, isOwner, openSnackbar]);

  useEffect(() => {
    if (tabs.indexOf(tab) !== -1) {
      if (tabs.indexOf(tab) !== tabSelected) {
        if (is.current) {
          setTabSelected(tabs.indexOf(tab));
        }
      }
    }
  }, [tab, tabSelected]);

  useEffect(() => {
    fetchUserChallenges();
  }, [fetchUserChallenges]);

  const onFollowUser = useCallback((e, fuid = duser.uid, fuser = duser) => {
    e.preventDefault();
    
		if (isAuth) {
			let computedFollowers = luid !== fuid ? { ...followers } : { ...lfollowers };
			let computedFollowings = luid !== uid ? { ...lfollowings } : { ...followings };
			// console.log({ luid, fuid, computedFollowers, computedFollowings, followers, followings, lfollowers, lfollowings });
      let snackbarMsg = '';
      let noteMsg = '';
      let followerDisplayName = '';
      const lindex = Object.keys(computedFollowers).indexOf(luid);
			const findex = Object.keys(computedFollowings).indexOf(fuid);			
			// console.log({ fuid, fuser, lindex, findex });

      if (lindex > -1 || findex > -1) {
        if (lindex > -1) delete computedFollowers[luid];
				if (findex > -1) delete computedFollowings[fuid];
        snackbarMsg = `Non segui più ${fuser.displayName}`;
      } else {
        computedFollowers = { 
          ...computedFollowers,
          [luid]: {
            displayName: user.displayName,
            photoURL: user.photoURL,
            timestamp: Date.now()
          }
        };
				computedFollowings = {
          ...computedFollowings,
          [fuid]: {
            displayName: fuser.displayName,
            photoURL: fuser.photoURL,
            timestamp: Date.now()
          }
        };
        snackbarMsg = `Segui ${fuser.displayName}`;
        const followerName = user.displayName.split(' ')[0];
        followerDisplayName = truncateString(followerName, 12);
        noteMsg = `<a href="/dashboard/${luid}">${followerDisplayName}</a> ha iniziato a seguirti`;
			}

      const maxFollowings = isPremium || isAdmin ? max.followings.premium : max.followings.standard;
  
      if (Object.keys(lfollowings).length < maxFollowings) {
        // VISITED
        followersRef(fuid).set(computedFollowers).then(() => {
          // Send notification to the followed user    
          if (noteMsg) {
            const newNoteRef = notesRef(fuid).doc();
            newNoteRef.set({
              nid: newNoteRef.id,
              text: noteMsg,
              created_num: Date.now(),
              createdBy: user.displayName,
              createdByUid: luid,
              photoURL: user.photoURL,
              tag: ['follow'],
              read: false,
              uid: fuid
            }).catch(err => console.warn(err));
          }
          // VISITOR
          followingsRef(luid).set(computedFollowings).then(() => {
            openSnackbar(snackbarMsg, 'success');
          }).catch(err => console.warn(`Followings error: ${err}`)); 
        }).catch(err => console.warn(`Followers error: ${err}`));
      } else {
        openSnackbar(`Limite massimo superato. ${(!isPremium || !isAdmin) && `Passa al piano premium per seguire più di ${maxFollowings} lettori`}`, 'error');
      }
    } else {
      openSnackbar('Utente non autenticato', 'error');
    }
  }, [duser, followers, followings, isAdmin, isAuth, isPremium, lfollowers, lfollowings, luid, openSnackbar, uid, user]);

  const historyPushTabIndex = useCallback(index => {
    const newPath = `/dashboard/${uid}/${tabs[index]}`;
    if (history !== newPath) {
      history.push(newPath, null);
    }
  }, [history, uid]);

  const onTabSelect = useCallback((e, value) => {
    if (value !== -1) {
      if (is.current) {
        setTabSelected(value);
        historyPushTabIndex(value);
      }
    }
  }, [historyPushTabIndex]);

  const onTabSelectIndex = useCallback((index, /* indexLatest, meta */) => {
    if (index !== -1) {
      if (is.current) {
        setTabSelected(index);
        historyPushTabIndex(index);
      }
    }
  }, [historyPushTabIndex]);

  const challengeBooks = useMemo(() => challenges?.length && challenges?.filter(challenge => challenge.completed_num !== challenge.books.length)[0].books, [challenges]);
  const challengeBooks_num = useMemo(() => challengeBooks && Object.keys(challengeBooks).length, [challengeBooks]);
  const challengeReadBooks_num = useMemo(() => challengeBooks && Object.keys(challengeBooks).filter(book => challengeBooks[book] === true).length, [challengeBooks]);
  const challengeProgress = useMemo(() => challengeBooks_num && challengeReadBooks_num ? Math.round(100 / challengeBooks_num * challengeReadBooks_num) : 0, [challengeBooks_num, challengeReadBooks_num]);
  const challengeCompleted = useMemo(() => challengeProgress === 100, [challengeProgress]);
  const isMini = useMemo(() => isTouchDevice() || screenSize === 'sm' || screenSize === 'xs', [screenSize]);
  const contactsSkeleton = useMemo(() => [...Array(3)].map((e, i) => <div key={i} className="avatar-row skltn" />), []);
  const creationYear = useMemo(() => duser && String(new Date(duser.creationTime).getFullYear()), [duser]);
  const Roles = useMemo(() => duser?.roles && Object.keys(duser.roles).map((role, i) => duser.roles[role] && (
    <div key={`${i}_${role}`} className={`badge ${role}`}>{role}</div>
  )), [duser]);

  const ShelfDetails = useMemo(() => () => (
    <div className="info-row footer centered shelfdetails">
      <span className="counter">{icon.book} <b>{duser ? duser.stats?.shelf_num : 0}</b> <span className="hide-sm">Libri</span></span>
      <span className="counter">{icon.heart} <b>{duser ? duser.stats?.wishlist_num : 0}</b> <span className="hide-sm">Desideri</span></span>
      <span className="counter">{icon.star} <b>{duser ? duser.stats?.ratings_num : 0}</b> <span className="hide-sm">Valutazioni</span></span>
      <span className="counter">{icon.messageText} <b>{duser ? duser.stats?.reviews_num : 0}</b> <span className="hide-sm">Recensioni</span></span>
    </div>
  ), [duser]);

  if (!duser && !loading) return <NoMatch title="Dashboard utente non trovata" history={history} location={location} />
  
  const UsersList = props => {
    const { users } = props; 
    return (
      <>
        {Object.keys(users).map(f => (
          <div key={f} className="avatar-row">
            <Link to={`/dashboard/${f}`} className="row ripple">
              <div className="col">
                <Avatar className="avatar" src={users[f].photoURL} alt={users[f].displayName}>{!users[f].photoURL && getInitials(users[f].displayName)}</Avatar>{users[f].displayName}
              </div>
              {!isMini && (
                <div className="col-auto">
                  <div className="timestamp hide-on-hover">{timeSince(users[f].timestamp)}</div>
                  {isOwner && f !== luid && (
                    <button type="button" className="btn flat show-on-hover" onClick={e => onFollowUser(e, f, users[f])}>
                      {users === followers ? 'Segui' : 'Non seguire'}
                    </button>
                  )}
                </div>
              )}
            </Link>
          </div> 
        ))}
        {/* 
          <PaginationControls // TODO
            count={users === followers ? followersCount : followingsCount} 
            fetch={users === followers ? fetchFollowers : fetchFollowings} 
            limit={4}
            loading={users === followers ? followersLoading : followingsLoading}
            oneWay
            page={users === followers ? followersPage : followingsPage}
          /> 
        */}
      </>
    );
  };

  UsersList.propTypes = {
    users: objectType.isRequired
  }

  const EmptyRow = () => (
    <div className="avatar-row empty">
      <div className="row">
        <div className="col"><Avatar className="avatar">{icon.accountOff}</Avatar> Nessuno</div>
      </div>
    </div>
  );

  const TabLabel = props => (
    <>
      <span className="icon show-md">{props.icon}</span>
      <span className="label">{props.label}</span>
    </>
  );

  TabLabel.propTypes = {
    icon: objectType.isRequired,
    label: stringType.isRequired
  }

  const tabSeoTitle = () => {
    switch (tabSelected) {
      case 0: return 'La libreria';
      case 1: return 'La lista dei desideri';
      case 2: return 'Le attività';
      case 3: return 'Le statistiche';
      case 4: return 'I contatti';
      default: return 'La dashboard';
    }
  };

  const UnauthReadingStats = () => (
    <div className="text-center">
      <h2>Utente non autorizzato</h2>
      {duser && <p>Solo {duser.displayName} può visualizzare le sue statistiche di lettura</p>}
    </div>
  );

  return (
    <div className="container" id="dashboardComponent" ref={is}>
      <Helmet>
        <title>{app.name} | {duser ? `${tabSeoTitle()} di ${duser.displayName}` : 'Dashboard utente'}</title>
        <link rel="canonical" href={app.url} />
        <meta name="description" content={app.desc} />
        {tabSelected && <link rel="canonical" href={`${app.url}/dashboard/${uid}/shelf`} />}
      </Helmet>
      <div className="row">
        <div className="col-md col-12">
          <div className="card dark basic-profile-card">
            <div className="basic-profile">
              {duser && (
                <Tooltip title="Ruolo utente" placement="left">
                  <div className="role-badges">{Roles} {!duser.roles?.editor && <div className="badge red">Utente bloccato</div>}</div>
                </Tooltip>
              )}
              <div className="row">
                <div className="col-auto">
                  <Avatar className="avatar" alt={duser ? duser.displayName : 'Avatar'}>
                    {!loading ? duser.photoURL ? (
                      <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                        <img alt="avatar" src={duser.photoURL} className="avatar thumb" />
                      </Zoom>
                    ) : getInitials(duser.displayName) : ''}
                  </Avatar>
                </div>
                <div className="col">
                  <h2 className="username">
                    {loading ? <span className="skltn area" /> : (
                      <span>{duser.displayName} {duser?.roles?.author && (
                        <Tooltip title={<span>Pagina autentica dell&apos;autore <Link to={`/author/${normURL(duser.displayName)}`}>{duser.displayName}</Link></span>} className="check-decagram primary-text" interactive>{icon.checkDecagram}</Tooltip>
                      )}</span>
                    )} 
                  </h2>
                  {loading ? <div className="skltn three rows" style={skltnStyle} /> : (
                    <>
                      <div className="info-row hide-xs">
                        {duser.sex && duser.sex !== 'x' && <span className="counter">{duser.sex === 'm' ? 'Uomo' : duser.sex === 'f' ? 'Donna' : ''}</span>}
                        {duser.birth_date && <span className="counter">{calcAge(duser.birth_date)} anni</span>}
                        <span className="counter comma strict">
                          {duser.city && <span className="counter">{duser.city}</span>}
                          {duser.country && <span className="counter">{duser.country}</span>}
                          {duser.continent && <span className="counter">{duser.continent}</span>}
                        </span>
                        {duser.languages && <span className="counter">{capitalize(joinToLowerCase(duser.languages))}</span>}
                        {creationYear && <span className="counter">Su {app.name} dal <b>{creationYear}</b></span>}
                        {isOwner && progress === 100 && <Link to="/profile"><button type="button" className="btn sm rounded flat counter">{icon.pencil} Modifica</button></Link>}
                      </div>
                      <div className="info-row">
                        {!isOwner && isAuth && (
                          <button 
                            type="button"
                            className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`} 
                            // disabled={!isAuth}
                            onClick={onFollowUser}>
                            {follow ? (
                              <>
                                <span className="hide-on-hover">{icon.check} Segui</span>
                                <span className="show-on-hover">Smetti</span>
                              </> 
                            ) : ( 
                              <span>{icon.plus} Segui</span>
                            )}
                          </button>
                        )}
                        <span className="counter"><b>{Object.keys(followers).length}</b> <span className="light-text">follower</span></span>
                        {screenSize !== 'sm' && <span className="counter"><b>{Object.keys(followings).length}</b> <span className="light-text">following</span></span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className="col-lg-2 col-md-3 col-12 hide-md flex">
            <div className="card dark pad-v-sm text-center flex align-items-center">
              <div className="container">
                <div className="progress-container">
                  <div className="progress-base" />
                  <CircularProgress variant="static" value={progress < 100 ? progress : !challengeCompleted ? challengeProgress : 0} size={60} max={100} thickness={3} />
                  <div className="progress-value">
                    {progress < 100 ? `${progress}%` : challengeBooks && !challengeCompleted ? `${challengeProgress}%` : icon.reader}
                  </div>
                </div>
                <div className="info-row">
                  <div className="counter last font-sm ligth-text">{progress < 100 ? 'Progresso profilo' : challengeBooks && !challengeCompleted ? `${challengeReadBooks_num} di ${challengeBooks_num} libri` : 'Nessuna sfida'}</div>
                  <Link to={progress < 100 ? '/profile' : challengeBooks && !challengeCompleted ? '/challenge' : '/challenges'} className="btn sm primary rounded">
                    {progress < 100 ? 'Completa' : challengeBooks && !challengeCompleted ? 'Vedi sfida' : 'Scegli sfida'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <AppBar position="static" className="appbar toppend mobile">
        <Tabs 
          // tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}
          value={tabSelected}
          onChange={onTabSelect}
          variant="fullWidth"
          // variant="scrollable"
          scrollButtons="auto">
          <Tab label={<TabLabel icon={icon.book} label="Libreria" />} />
          <Tab label={<TabLabel icon={icon.heart} label="Desideri" />} />
          <Tab label={<TabLabel icon={icon.messageText} label="Attività" />} />
          <Tab label={<TabLabel icon={icon.poll} label="Statistiche" />} disabled={!isOwner} />
          <Tab label={<TabLabel icon={icon.account} label="Contatti" />} />
        </Tabs>
      </AppBar>
      <BindKeyboardSwipeableViews 
        enableMouseEvents
        resistance
        className="card light tabs-container bottompend mobile"
        axis="x"
        index={tabSelected}
        onChangeIndex={onTabSelectIndex}>
        <div className="card tab" dir={tabDir}>
          {tabSelected === 0 && <Shelf openSnackbar={openSnackbar} luid={luid} uid={uid} shelf="bookInShelf" />}
        </div>
        <div className="card tab" dir={tabDir}>
          {tabSelected === 1 && <Shelf openSnackbar={openSnackbar} luid={luid} uid={uid} shelf="bookInWishlist" />}
        </div>
        <div className="card tab" dir={tabDir}>
          {tabSelected === 2 && <Reviews uid={uid} limit={3} container={false} pagination skeleton />}
        </div>
        <div className="card tab" dir={tabDir}>
          {tabSelected === 3 && (loading || isOwner ? <ReadingStats loading={loading} uid={uid} /> : <UnauthReadingStats />)}
        </div>
        <div className="card tab contacts-tab" dir={tabDir}>
          {tabSelected === 4 && (
            <div className="row">
              <div className="col-md-6 cols-12 contacts-tab-col">
                <h4>Seguito da:</h4>
                {loading ? contactsSkeleton : Object.keys(followers).length ? <UsersList users={followers} /> : <EmptyRow />}
              </div>
              <div className="col-md-6 col-12 contacts-tab-col">
                <h4>Segue:</h4>
                {loading ? contactsSkeleton : Object.keys(followings).length ? <UsersList users={followings} /> : <EmptyRow />}
              </div>
            </div>
          )}
        </div>
      </BindKeyboardSwipeableViews>
      <ShelfDetails />
    </div>
  );
}

Dashboard.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType
}

Dashboard.defaultProps = {
  history: null,
  location: null,
  match: null
}
 
export default Dashboard;