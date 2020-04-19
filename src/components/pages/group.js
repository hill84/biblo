import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import React, { forwardRef, lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { groupFollowersRef, groupRef, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, getInitials, handleFirestoreError } from '../../config/shared';
import { historyType, locationType, matchType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/groups.css';
import Discussions from '../discussions';
import DiscussionForm from '../forms/discussionForm';
import GroupForm from '../forms/groupForm';
import MinifiableText from '../minifiableText';
import Bubbles from './bubbles';

const NoMatch = lazy(() => import('../noMatch'));

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const seo = {
  title: `${app.name} | Groups`
};

const unsub = {
  fetchGroups: null,
  groupModeratorsFetch: null,
  groupFollowersFetch : null
};

const Group = props => {
  const { isAdmin, isAuth, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(null);
  const [moderators, setModerators] = useState(null);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [redirectToReferrer, setRedirectToReferrer] = useState(null);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenModeratorsDialog, setIsOpenModeratorsDialog] = useState(false);
  const { history, location, match } = props;
  const { gid } = match.params;
  const is = useRef(true);
  
  const isOwner = useMemo(() => user?.uid === item?.ownerUid, [item, user]);
  const isModerator = useMemo(() => item?.moderators.some(uid => uid === user?.uid), [item, user]);
  
  const fetchFollowers = useCallback(() => {    
    if (is.current) setLoading(true);
    unsub.groupFollowersFetch = groupFollowersRef(gid).onSnapshot(snap => {
      if (!snap.empty) {
        const followers = [];
        snap.forEach(follower => followers.push(follower.data()));
        if (is.current) {
          setFollowers(followers);
        }
      } else if (is.current) {
        setFollowers(null);
        setFollow(false);
      }
    }, err => openSnackbar(handleFirestoreError(err), 'error'));
  }, [gid, openSnackbar]);

  const fetchModerators = useCallback(moderators => { 
    const items = [];
    unsub.groupModeratorsFetch = moderators.forEach(uid => {
      userRef(uid).get().then(snap => {
        if (snap.exists) {
          items.push(snap.data());
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    });
    setModerators(items);
  }, [openSnackbar]);

  const fetchGroup = useCallback(() => {
    if (is.current) setLoading(true);
    unsub.fetchGroup = groupRef(gid).onSnapshot(snap => {
      if (snap.exists) {
        if (is.current) {
          setItem(snap.data());
          setLoading(false);
        }
        fetchFollowers();
        if (snap.data().moderators?.length > 1) {
          fetchModerators(snap.data().moderators);
        }
      }
    }, err => openSnackbar(handleFirestoreError(err), 'error'));
  }, [fetchFollowers, fetchModerators, gid, openSnackbar]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  useEffect(() => {
    if (followers && is.current) {
      setFollow(followers.some(follower => follower.uid === user?.uid));
    }
  }, [followers, user]);

  useEffect(() => () => {
    is.current = false;
    unsub?.groupFollowersFetch?.();
    unsub?.fetchGroup?.();
    unsub?.fetchDiscussions?.();
  }, []);

  const onFollow = () => {
    if (follow) {
      groupFollowersRef(gid).doc(user.uid).delete().then(() => setFollow(false)).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      groupFollowersRef(gid).doc(user.uid).set({
        gid,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: Date.now()
      }).then(() => setFollow(true)).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const onEditGroup = () => setIsOpenEditDialog(true);

  const onToggleEditDialog = () => setIsOpenEditDialog(isOpenEditDialog => !isOpenEditDialog);

  const onDeleteRequest = () => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = () => {
    if (is.current) {
      setIsOpenDeleteDialog(false);
      setRedirectToReferrer(true);
    }

    groupRef(gid).delete().then(() => {
      // TODO: delete group discussions
      openSnackbar('Gruppo cancellato', 'success');
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  };

  const onInvite = () => console.log('onInvite');

  const onOpenModeratorsDialog = () => setIsOpenModeratorsDialog(true);

  const onCloseModeratorsDialog = () => setIsOpenModeratorsDialog(false);

  const onDeleteModerator = e => {
    const { muid } = e.currentTarget.dataset;
    const restList = item.moderators.filter(m => m !== muid);
    const rest = moderators.filter(m => m.uid !== muid);

    groupRef(gid).update({
      ...item,
      moderators: restList
    }).then(() => {
      if (is.current) {
        setModerators(rest);
      }
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  };

  if (redirectToReferrer) return <Redirect to="/groups" />

  if (!loading && !item) return <NoMatch title="Gruppo non trovato" history={history} location={location} />

  return (
    <div className="container" ref={is}>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      <div className="card light group relative">
        <Link to="/groups" className="btn clear dark rounded icon prepend absolute-content left">
          {icon.arrowLeft}
        </Link>
        {isEditor && (isOwner || isModerator || isAdmin) && (
          <div className="absolute-top-right">
            {(isOwner || isAdmin) && (
              <button
                type="button"
                className="btn sm flat counter"
                onClick={onDeleteRequest}>
                {icon.delete} <span className="hide-sm">Elimina</span>
              </button>
            )}
            <button
              type="button"
              className="btn sm flat counter"
              onClick={onEditGroup}>
              {icon.pencil} <span className="hide-sm">Modifica</span>
            </button>
          </div>
        )}

        <div className="row info-row header">
          <div className="col-auto">
            <Avatar className="image avatar">
              {!item ? '' : !item.photoURL ? icon.accountGroup : (
                <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                  <img alt="avatar" src={item.photoURL} className="avatar thumb" />
                </Zoom>
              )}
            </Avatar>
          </div>
          <div className="col">
            <h2 className="title flex">{item?.title || <span className="skltn area" />}</h2>
            <div className="info-row owner flex">
              {item ? (
                <>
                  <span className="counter">Creato da <Link to={`/dashboard/${item.ownerUid}`}>{item.owner}</Link></span>
                  {item.moderators?.length > 1 && (
                    <button
                      type="button"
                      className="counter link"
                      onClick={onOpenModeratorsDialog}>
                      {item.moderators.length} moderatori
                    </button>
                  )}
                </>
              ) : <span className="skltn rows one" />}
            </div>
          </div>
        </div>

        <div className="info-row text">
          {item ? <MinifiableText text={item.description} maxChars={500} /> : <div className="skltn rows" />}
        </div>

        {isAuth && user && (
          <div className="info-row">
            <button 
              type="button" 
              className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`} 
              onClick={onFollow} 
              disabled={!isEditor}>
              {follow ? (
                <>
                  <span className="hide-on-hover">{icon.check} Segui</span>
                  <span className="show-on-hover">Smetti</span>
                </> 
              ) : <span>{icon.plus} Segui</span> }
            </button>
            <div className="counter inline">
              <Bubbles limit={3} items={followers} />
            </div>
            {follow && (
              <button
                type="button"
                className="link counter last inline"
                onClick={onInvite}
                title="Questa funzionalità non è ancora pronta"
                disabled>
                Invita
              </button>
            )}
          </div>
        )}
      </div>

      {item?.rules && (
        <div className="card rules">
          <h3>Regole del gruppo</h3>
          <MinifiableText text={item.rules} maxChars={500} toggle />
        </div>
      )}

      {isAuth && isEditor && <DiscussionForm gid={gid} />}

      <Discussions gid={gid} isGroupModerator={isModerator} isGroupOwner={isOwner} />

      {isOpenEditDialog && <GroupForm id={gid} onToggle={onToggleEditDialog} />}

      {isOpenModeratorsDialog && (
        <Dialog
          className="moderators-dialog"
          open={isOpenModeratorsDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseModeratorsDialog}
          aria-labelledby="moderators-dialog-title"
          aria-describedby="moderators-dialog-description">
          <DialogTitle>
            Moderatori del gruppo
          </DialogTitle>
          <DialogContent className="content">
            <div className="contacts-tab">
              {moderators?.length ? moderators.map(user => (
                <div key={user.uid} className="avatar-row">
                  <div className="row">
                    <div className="col-auto">
                      <Link to={`/dashboard/${user.uid}`}>
                        <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>
                          {!user.photoURL && getInitials(user.displayName)}
                        </Avatar>
                      </Link>
                    </div>
                    <div className="col">
                      <div className="row">
                        <Link to={`/dashboard/${user.uid}`} className="col name">{user.displayName}</Link>
                        {isEditor && (
                          <div className="col-auto">
                            {user.uid === item.ownerUid ? (
                              <button type="button" className="btn sm rounded flat" disabled>Creatore</button>
                            ) : (isOwner || isAdmin) && (
                              <button
                                type="button"
                                className="btn sm rounded flat"
                                data-muid={user.uid}
                                onClick={onDeleteModerator}>
                                Elimina
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : <div>Nessun moderatore</div>}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isOpenDeleteDialog && (
        <Dialog
          open={isOpenDeleteDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description">
          <DialogTitle id="delete-dialog-title">
            Procedere con l&apos;eliminazione?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Cancellando il gruppo verranno rimossi tutti i commenti.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={onDelete}>Elimina</button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

Group.propTypes = {
  history: historyType.isRequired,
  location: locationType.isRequired,
  match: matchType
}

Group.defaultProps = {
  match: null
}

export default Group;