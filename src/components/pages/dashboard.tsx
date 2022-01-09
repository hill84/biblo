import { FirestoreError } from '@firebase/firestore-types';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';
import classnames from 'classnames';
import React, { ChangeEvent, CSSProperties, FC, Fragment, lazy, MouseEvent, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { Link, RouteComponentProps } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import { followersRef, followingsRef, notesRef } from '../../config/firebase';
import icon from '../../config/icons';
import { dashboardTabs as tabs } from '../../config/lists';
import { app, booksPerRow, calcAge, capitalize, getInitials, isScrollable, joinToLowerCase, normURL, screenSize as _screenSize, timeSince, truncateString } from '../../config/shared';
import DashboardContext from '../../context/dashboardContext';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/dashboard.css';
import { FollowersModel, IsCurrent, ScreenSizeType, UserChallengeModel } from '../../types';
import ReadingStats from '../readingStats';
import Reviews from '../reviews';
import Shelf from '../shelf';
// import PaginationControls from '../paginationControls'; // TODO

const NoMatch = lazy(() => import('../noMatch'));

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

const tabDir = undefined;

const skltnStyle: CSSProperties = { margin: '.4em 0', };

interface MaxModel {
  followings: {
    premium: number;
    standard: number;
  };
}

const max: MaxModel = {
  followings: {
    premium: 50,
    standard: 10
  }
};

export type DashboardProps = RouteComponentProps<MatchParams>;

interface MatchParams {
  tab?: string;
  uid: string;
}

const Dashboard: FC<DashboardProps> = ({ history, location, match }: DashboardProps) => {
  const { tab = '', uid } = match.params || {};
  const { isAdmin, isAuth, isPremium, user } = useContext(UserContext);
  const luid: string = user?.uid || '';
  const isOwner: boolean = luid === uid;
  const { closeSnackbar, openSnackbar } = useContext(SnackbarContext);
  const { duser, challenges, followers, followings, follow, lfollowers, lfollowings, loading, progress, shelfCount, shelfItems, wishlistCount, wishlistItems, fetchUser, fetchFollowers, fetchFollowings, fetchuserChallengesRef, setShelfCount, setShelfItems, setWishlistCount, setWishlistItems } = useContext(DashboardContext);
  const [tabSelected, setTabSelected] = useState<number>(tab ? tabs.indexOf(tab) !== -1 ? tabs.indexOf(tab) : 0 : 0);
  const [screenSize, setScreenSize] = useState<ScreenSizeType>(_screenSize());
  const [shelfLimit, setShelfLimit] = useState<number>((booksPerRow() * 2) - (isOwner ? 1 : 0));
  
  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
    return () => { is.current = false };
  }, []);

  const updateLimit = useCallback((): void => {
    setShelfLimit((booksPerRow() * 2) - (isOwner ? 1 : 0));
  }, [isOwner]);

  useEffect(() => {
    updateLimit();
  }, [updateLimit]);

  useEffect(() => {
    window.addEventListener('resize', updateLimit);

    return () => { window.removeEventListener('resize', updateLimit) };
  }, [updateLimit]);

  useEffect(() => {
    const updateScreenSize = (): void => {
      setScreenSize(_screenSize());
    };

    window.addEventListener('resize', updateScreenSize);

    return () => { window.removeEventListener('resize', updateScreenSize) };
  }, []);

  useEffect(() => {
    if (uid) {
      fetchUser(uid, luid);
      fetchFollowers(uid, luid);
      fetchFollowings(uid, luid);
      fetchuserChallengesRef(luid);
    }
  }, [fetchUser, fetchFollowers, fetchFollowings, fetchuserChallengesRef, luid, uid]);

  useEffect(() => {
    if (uid) {
      if (tabSelected === 0) {
        const newPath = `/dashboard/${uid}/${tabs[0]}`;
        if (history.location.pathname !== newPath) {
          history.replace(newPath, null);
        }
      }
    }
  }, [history, tabSelected, uid]);

  useEffect(() => {
    if (isOwner && !user?.photoURL) {
      const msg = <span>Non hai <span className='hide-sm'>ancora caricato</span> una foto profilo.</span>;
      const action = <Link to='/profile' type='button' className='btn sm flat' onClick={closeSnackbar}>Aggiungila</Link>;
      setTimeout((): void => {
        openSnackbar(msg, 'info', 6000, action);
      }, 3000);
    }
  }, [closeSnackbar, isOwner, openSnackbar, user]);

  useEffect(() => {
    if (tabs.indexOf(tab) !== -1) {
      if (tabs.indexOf(tab) !== tabSelected) {
        if (is.current) {
          setTabSelected(tabs.indexOf(tab));
        }
      }
    }
  }, [tab, tabSelected]);

  const onFollowUser = useCallback((e: MouseEvent<HTMLButtonElement>, fuid = duser?.uid, fuser = duser) => {
    e.preventDefault();
    
    if (isAuth && fuid && user && fuser) {
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
        const followerName: string = user.displayName.split(' ')[0];
        followerDisplayName = truncateString(followerName, 12);
        noteMsg = `<a href='/dashboard/${luid}'>${followerDisplayName}</a> ha iniziato a seguirti`;
      }

      const maxFollowings: number = isPremium || isAdmin ? max.followings.premium : max.followings.standard;
  
      if (Object.keys(lfollowings).length < maxFollowings) {
        // VISITED
        followersRef(fuid).set(computedFollowers).then((): void => {
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
            }).catch((err: FirestoreError): void => console.warn(err));
          }
          // VISITOR
          followingsRef(luid).set(computedFollowings).then((): void => {
            openSnackbar(snackbarMsg, 'success');
          }).catch((err: FirestoreError): void => console.warn(`Followings error: ${err}`)); 
        }).catch((err: FirestoreError): void => console.warn(`Followers error: ${err}`));
      } else {
        openSnackbar(`Limite massimo superato. ${(!isPremium || !isAdmin) && `Passa al piano premium per seguire più di ${maxFollowings} lettori`}`, 'error');
      }
    } else {
      openSnackbar('Utente non autenticato', 'error');
    }
  }, [duser, followers, followings, isAdmin, isAuth, isPremium, lfollowers, lfollowings, luid, openSnackbar, uid, user]);

  const historyPushTabIndex = (index: number): void => {
    const newPath = `/dashboard/${uid}/${tabs[index]}`;
    if (history.location.pathname !== newPath) {
      history.push(newPath, null);
    }
  };

  const onTabSelect = (_e: ChangeEvent<{}>, value: number): void => {
    if (value !== -1) {
      if (is.current) {
        setTabSelected(value);
        historyPushTabIndex(value);
      }
    }
  };

  const onTabSelectIndex = (index: number, /* indexLatest, meta */): void => {
    if (index !== -1) {
      if (is.current) {
        setTabSelected(index);
        historyPushTabIndex(index);
      }
    }
  };

  const challengeBooks = useMemo((): UserChallengeModel['books'] | undefined => challenges?.filter((challenge: UserChallengeModel): boolean => challenge.completed_num !== Object.keys(challenge.books)?.length)?.[0]?.books, [challenges]);
  const challengeBooks_num = useMemo((): number => challengeBooks ? Object.keys(challengeBooks).length : 0, [challengeBooks]);
  const challengeReadBooks_num = useMemo((): number => challengeBooks ? Object.keys(challengeBooks).filter((book: string): boolean => challengeBooks[book] === true).length : 0, [challengeBooks]);
  const challengeProgress = useMemo((): number => challengeBooks_num && challengeReadBooks_num ? Math.round(100 / challengeBooks_num * challengeReadBooks_num) : 0, [challengeBooks_num, challengeReadBooks_num]);
  const challengeCompleted = useMemo((): boolean => challengeProgress === 100, [challengeProgress]);
  const isMini = useMemo((): boolean => isScrollable(screenSize), [screenSize]);
  const creationYear = useMemo((): string => duser ? String(new Date(duser.creationTime).getFullYear()) : '', [duser]);
  
  
  const contactsSkeleton = () => [...Array(3)].map((_e, i: number) => <div key={i} className='avatar-row skltn' />);
  
  const ShelfDetails: FC = () => (
    <div className='info-row footer centered shelfdetails'>
      <span className='counter'>{icon.book} <b>{duser ? duser.stats?.shelf_num : 0}</b> <span className='hide-sm'>Libri</span></span>
      <span className='counter'>{icon.heart} <b>{duser ? duser.stats?.wishlist_num : 0}</b> <span className='hide-sm'>Desideri</span></span>
      <span className='counter'>{icon.star} <b>{duser ? duser.stats?.ratings_num : 0}</b> <span className='hide-sm'>Valutazioni</span></span>
      <span className='counter'>{icon.messageText} <b>{duser ? duser.stats?.reviews_num : 0}</b> <span className='hide-sm'>Recensioni</span></span>
    </div>
  );

  if (!duser && !loading) return (
    <NoMatch title='Dashboard utente non trovata' history={history} location={location} />
  );

  interface UsersListProps {
    followings?: FollowersModel;
    users: FollowersModel;
  }
  
  const UsersList: FC<UsersListProps> = ({ followings, users }: UsersListProps) => {
    return (
      <Fragment>
        {Object.keys(users).map(f => (
          <div key={f} className='avatar-row rounded'>
            <Link to={`/dashboard/${f}`} className='row ripple'>
              <div className='col'>
                <Avatar
                  className='avatar'
                  src={users[f].photoURL}
                  alt={users[f].displayName}>
                  {!users[f].photoURL && users[f].displayName ? getInitials(users[f].displayName) : icon.accountOff}
                </Avatar> 
                {users[f].displayName}
              </div>
              {!isMini && followings && (
                <div className='col-auto'>
                  <div className='timestamp hide-on-hover'>{timeSince(users[f].timestamp)}</div>
                  {isOwner && f !== luid && (
                    <button
                      type='button'
                      className='btn flat rounded show-on-hover'
                      onClick={e => onFollowUser(e, f, users[f])}
                      disabled={users === followers && Object.keys(followings).includes(f)}>
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
      </Fragment>
    );
  };

  const EmptyRow = () => (
    <div className='avatar-row empty'>
      <div className='row'>
        <div className='col'><Avatar className='avatar'>{icon.accountOff}</Avatar> Nessuno</div>
      </div>
    </div>
  );

  interface TabLabelProps { 
    icon: ReactNode;
    label: string;
  }

  const TabLabel: FC<TabLabelProps> = ({ icon, label }: TabLabelProps) => (
    <Fragment>
      <span className='icon show-md'>{icon}</span>
      <span className='label'>{label}</span>
    </Fragment>
  );

  const tabSeoTitle = (): string => {
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
    <div className='text-center'>
      <h2>Utente non autorizzato</h2>
      {duser && <p>Solo {duser.displayName} può visualizzare le sue statistiche di lettura</p>}
    </div>
  );

  return (
    <div className='container' id='dashboardComponent' ref={is}>
      <Helmet>
        <title>{app.name} | {duser ? `${tabSeoTitle()} di ${duser.displayName}` : 'Dashboard utente'}</title>
        <link rel='canonical' href={app.url} />
        <meta name='description' content={app.desc} />
        {tabSelected && <link rel='canonical' href={`${app.url}/dashboard/${uid}/shelf`} />}
      </Helmet>
      <div className='row'>
        <div className={isOwner ? 'col-lg-10 col-md-9 col' : 'col'}>
          <div className='card dark basic-profile-card'>
            <div className='basic-profile'>
              {duser && (
                <div className='absolute-top-right'>
                  {!duser?.roles?.editor ? (
                    <div className='badge red'>Utente bloccato</div> 
                  ) : isOwner && progress === 100 && (
                    <Link to='/profile' className='btn sm flat counter'>{icon.pencil} Modifica</Link> 
                  )}
                </div>
              )}
              <div className='row'>
                <div className='col-auto'>
                  <Avatar className='avatar' alt={duser ? duser.displayName : 'Avatar'}>
                    {!loading ? duser?.photoURL ? (
                      <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
                        <img alt='' src={duser.photoURL} className='avatar thumb' />
                      </Zoom>
                    ) : duser?.displayName ? getInitials(duser.displayName) : '' : ''}
                  </Avatar>
                </div>
                <div className='col col-right'>
                  <h2 className='username'>
                    {loading ? <span className='skltn area' /> : (
                      <span>
                        {duser?.displayName} {duser?.displayName && duser?.roles?.author && (
                          <Tooltip className='check-decagram primary-text' interactive title={(
                            <Fragment>Pagina autentica dell&apos;autore <Link to={`/author/${normURL(duser.displayName)}`}>{duser.displayName}</Link></Fragment>
                          )}>{icon.checkDecagram}</Tooltip>
                        )}
                      </span>
                    )} 
                  </h2>
                  {loading ? <div className='skltn three rows' style={skltnStyle} /> : (
                    <Fragment>
                      <div className='info-row hide-xs'>
                        {duser?.sex && duser.sex !== 'x' && <span className='counter'>{duser.sex === 'm' ? 'Uomo' : duser.sex === 'f' ? 'Donna' : ''}</span>}
                        {duser?.birth_date && <span className='counter'>{calcAge(duser.birth_date)} anni</span>}
                        <span className='counter comma strict'>
                          {duser?.city && <span className='counter'>{duser.city}</span>}
                          {duser?.country && <span className='counter'>{duser.country}</span>}
                          {duser?.continent && <span className='counter'>{duser.continent}</span>}
                        </span>
                        {duser?.languages && !isMini && <span className='counter'>{capitalize(joinToLowerCase(duser.languages))}</span>}
                        {creationYear && !isMini && <span className='counter'>Su {app.name} dal <b>{creationYear}</b></span>}
                      </div>
                      <div className='info-row ellipsis'>
                        {!isOwner && isAuth && (
                          <button 
                            type='button'
                            className={classnames('btn', 'sm', follow ? 'success error-on-hover' : 'primary')} 
                            // disabled={!isAuth}
                            onClick={onFollowUser}>
                            {!follow ? <span>{icon.plus} Segui</span> : (
                              <Fragment>
                                <span className='hide-on-hover'>{icon.check} Segui</span>
                                <span className='show-on-hover'>Smetti</span>
                              </Fragment> 
                            )}
                          </button>
                        )}
                        <span className='counter'><b>{Object.keys(followers).length}</b> <span className='light-text'>follower</span></span>
                        {!isMini && <span className='counter'><b>{Object.keys(followings).length}</b> <span className='light-text'>following</span></span>}
                        {duser?.website && <span className='counter'>{!isMini && <b>{icon.web}</b>} <a href={duser.website} target='_blank' rel='noopener noreferrer'>web<span className='hide-md'>site</span></a></span>}
                        {duser?.youtube && <span className='counter'>{!isMini && <b>{icon.youtube}</b>} <a href={`https://www.youtube.com/channel/${duser.youtube}`} target='_blank' rel='noopener noreferrer'>youtube</a></span>}
                        {duser?.instagram && <span className='counter'>{!isMini && <b>{icon.instagram}</b>} <a href={`https://www.instagram.com/${duser.instagram}`} target='_blank' rel='noopener noreferrer'>instagram</a></span>}
                        {duser?.twitch && <span className='counter'>{!isMini && <b>{icon.twitch}</b>} <a href={`https://www.twitch.tv/${duser.twitch}`} target='_blank' rel='noopener noreferrer'>twitch</a></span>}
                        {duser?.facebook && <span className='counter'>{!isMini && <b>{icon.facebook}</b>} <a href={`https://www.facebook.com/${duser.facebook}`} target='_blank' rel='noopener noreferrer'>facebook</a></span>}
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {isOwner && (
          <div className='col-lg-2 col-md-3 col-12 hide-md flex'>
            <div className='card dark pad-v-sm text-center flex align-items-center'>
              <div className='container'>
                <div className='progress-container'>
                  <div className='progress-base' />
                  <CircularProgress variant='determinate' value={progress < 100 ? progress : !challengeCompleted ? challengeProgress : 0} size={60} thickness={3} />
                  <div className='progress-value'>
                    {progress < 100 ? `${progress}%` : challengeBooks && !challengeCompleted ? `${challengeProgress}%` : icon.reader}
                  </div>
                </div>
                <div className='info-row'>
                  <div className='counter last font-sm ligth-text'>{progress < 100 ? 'Progresso profilo' : challengeBooks && !challengeCompleted ? `${challengeReadBooks_num} di ${challengeBooks_num} libri` : 'Nessuna sfida'}</div>
                  <Link to={progress < 100 ? '/profile' : challengeBooks && !challengeCompleted ? '/challenge' : '/challenges'} className='btn sm primary rounded'>
                    {progress < 100 ? 'Completa' : challengeBooks && !challengeCompleted ? 'Vedi sfida' : 'Scegli sfida'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <AppBar position='static' className='appbar toppend mobile'>
        <Tabs 
          // tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}
          value={tabSelected}
          onChange={onTabSelect}
          variant='fullWidth'
          // variant='scrollable'
          scrollButtons='auto'>
          <Tab label={<TabLabel icon={icon.book} label='Libreria' />} />
          <Tab label={<TabLabel icon={icon.heart} label='Desideri' />} />
          <Tab label={<TabLabel icon={icon.messageText} label='Attività' />} />
          <Tab label={<TabLabel icon={icon.poll} label='Statistiche' />} disabled={!isOwner} />
          <Tab label={<TabLabel icon={icon.account} label='Contatti' />} />
        </Tabs>
      </AppBar>
      <BindKeyboardSwipeableViews 
        enableMouseEvents
        resistance
        className='card light tabs-container bottompend mobile'
        axis='x'
        index={tabSelected}
        onChangeIndex={onTabSelectIndex}>
        <div className='card tab' dir={tabDir}>
          {(tabSelected === 0 || shelfItems.length) && (
            <Shelf
              count={shelfCount}
              limit={shelfLimit}
              luid={luid}
              items={shelfItems}
              setCount={setShelfCount}
              setItems={setShelfItems}
              uid={uid}
              shelf='shelf'
            />
          )}
        </div>
        <div className='card tab' dir={tabDir}>
          {(tabSelected === 1 || wishlistItems.length) && (
            <Shelf
              count={wishlistCount}
              limit={shelfLimit}
              luid={luid}
              items={wishlistItems}
              setCount={setWishlistCount}
              setItems={setWishlistItems}
              uid={uid}
              shelf='wishlist'
            />
          )}
        </div>
        <div className='card tab' dir={tabDir}>
          {tabSelected === 2 && <Reviews uid={uid} limit={3} container={false} pagination skeleton />}
        </div>
        <div className='card tab' dir={tabDir}>
          {tabSelected === 3 && (loading || isOwner ? <ReadingStats loading={loading} uid={uid} /> : <UnauthReadingStats />)}
        </div>
        <div className='card tab contacts-tab' dir={tabDir}>
          {tabSelected === 4 && (
            <div className='row'>
              <div className='col-md-6 col-12 contacts-tab-col'>
                <h4>Seguito da:</h4>
                {loading ? contactsSkeleton : Object.keys(followers).length ? (
                  <UsersList users={followers} followings={followings} />
                ) : (
                  <EmptyRow />
                )}
              </div>
              <div className='col-md-6 col-12 contacts-tab-col'>
                <h4>Segue:</h4>
                {loading ? contactsSkeleton : Object.keys(followings).length ? (
                  <UsersList users={followings} /> 
                ) : (
                  <EmptyRow />
                )}
              </div>
            </div>
          )}
        </div>
      </BindKeyboardSwipeableViews>
      <ShelfDetails />
    </div>
  );
};

export default Dashboard;