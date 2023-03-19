import type { FirestoreError } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import Tooltip from '@material-ui/core/Tooltip';
import type { TransitionProps } from '@material-ui/core/transitions';
import classnames from 'classnames';
import type { FC, MouseEvent, ReactElement, Ref } from 'react';
import { forwardRef, lazy, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import type { RouteComponentProps } from 'react-router-dom';
import { Link, Redirect } from 'react-router-dom';
import { groupFollowersRef, groupRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, getInitials, handleFirestoreError } from '../../config/shared';
import GroupContext from '../../context/groupContext';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/groups.css';
import type { CurrentTarget, IsCurrent, ModeratorModel } from '../../types';
import Discussions from '../discussions';
import DiscussionForm from '../forms/discussionForm';
import GroupForm from '../forms/groupForm';
import MinifiableText from '../minifiableText';
import Bubbles from './bubbles';

const NoMatch = lazy(() => import('../noMatch'));

const Transition = forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

export type GroupProps = RouteComponentProps<MatchParams>;

interface MatchParams {
  gid: string;
}

const Group: FC<GroupProps> = ({ history, location, match }: GroupProps) => {
  const { isAdmin, isAuth, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { 
    clearStates, 
    fetchGroup, 
    follow, 
    followers, 
    isOwner, 
    isModerator, 
    item, 
    loading, 
    moderators: groupModerators, 
    setFollow, 
    setLoading,
    setModerators 
  } = useContext(GroupContext);
  
  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false);
  const [redirectToReferrer, setRedirectToReferrer] = useState<boolean>(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenModeratorsDialog, setIsOpenModeratorsDialog] = useState<boolean>(false);
  const { gid } = match.params;

  const { t } = useTranslation(['common', 'form']);

  const is = useRef<IsCurrent>(false);

  const seo = {
    title: `${app.name} | ${t('PAGE_GROUP')}`
  };

  useEffect(() => {
    is.current = true;
  }, []);

  useEffect(() => {
    fetchGroup(gid);
  }, [fetchGroup, gid]);

  useEffect(() => () => {
    clearStates();
    is.current = false;
  }, [clearStates]);

  const onFollow = (): void => {
    if (user) {
      if (follow) {
        groupFollowersRef(gid).doc(user.uid).delete().then((): void => {
          if (is.current) setFollow(false);
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        });
      } else {
        groupFollowersRef(gid).doc(user.uid).set({
          gid,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          timestamp: Date.now()
        }).then((): void => {
          if (is.current) setFollow(true);
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        });
      }
    } else console.warn('No user');
  };

  const onEditGroup = (): void => setIsOpenEditDialog(true);

  const onToggleEditDialog = (): void => setIsOpenEditDialog(isOpenEditDialog => !isOpenEditDialog);

  const onDeleteRequest = (): void => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = (): void => setIsOpenDeleteDialog(false);

  const onDelete = (): void => {
    setIsOpenDeleteDialog(false);
    groupRef(gid).delete().then((): void => {
      // TODO: delete group discussions
      setLoading(true);
      openSnackbar(t('SUCCESS_DELETED_ITEM'), 'success');
      setTimeout((): void => {
        setLoading(false);
        setRedirectToReferrer(true);
      }, 1500);
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  };

  const onInvite = (): void => console.log('onInvite'); // TODO

  const onOpenModeratorsDialog = (): void => setIsOpenModeratorsDialog(true);

  const onCloseModeratorsDialog = (): void => setIsOpenModeratorsDialog(false);

  const onDeleteModerator = (e: MouseEvent): void => {
    const { muid } = (e.currentTarget as CurrentTarget).dataset || {};
    const restList: string[] = item?.moderators?.filter((m: string): boolean => m !== muid) || [];
    const rest: ModeratorModel[] = groupModerators.filter((m: ModeratorModel): boolean => m.uid !== muid);

    groupRef(gid).update({
      ...item,
      moderators: restList
    }).then((): void => {
      if (is.current) setModerators(rest);
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  };

  const onLock = (): void => {
    if (item) {
      groupRef(gid).update({ edit: !item.edit }).then((): void => {
        openSnackbar(t(`form:${item.edit ? 'SUCCESS_LOCKED_ITEM' : 'SUCCESS_UNLOCKED_ITEM'}`), 'success');
      }).catch((err: FirestoreError): void => {
        openSnackbar(handleFirestoreError(err), 'error');
      });
    } else console.warn('No item');
  };

  if (redirectToReferrer) return <Redirect to='/groups' />;

  if (!loading && !item) return <NoMatch title={t('GROUP_NOT_FOUND')} history={history} location={location} />;

  return (
    <div className='container' ref={is}>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      <div className='card light group relative'>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <Link to='/groups' title={t('PAGE_GROUPS')} className='btn clear dark rounded icon prepend absolute-content left hide-sm'>
          {icon.arrowLeft}
        </Link>
        {isEditor && (isOwner || isModerator || isAdmin) ? (
          <div className='absolute-top-right'>
            {(isOwner || isAdmin) && (
              <>
                <button
                  type='button'
                  className='btn sm flat counter icon-sm'
                  onClick={onLock}>
                  {icon[item?.edit ? 'lock' : 'lockOpen']} <span className='hide-sm'>{t(item?.edit ? 'ACTION_LOCK' : 'ACTION_UNLOCK')}</span>
                </button>
                <button
                  type='button'
                  className='btn sm flat counter icon-sm'
                  onClick={onDeleteRequest}>
                  {icon.delete} <span className='hide-sm'>{t('ACTION_DELETE')}</span>
                </button>
              </>
            )}
            <button
              type='button'
              className='btn sm flat counter icon-sm'
              onClick={onEditGroup}>
              {icon.pencil} <span className='hide-sm'>{t('ACTION_EDIT')}</span>
            </button>
          </div>
        ) : !item?.edit && !loading && (
          <Tooltip title={t('LOCKED_GROUP')}>
            <div className='absolute-top-right lighter-text'>{icon.lock}</div>
          </Tooltip>
        )}

        <div className='row info-row header'>
          <div className='col-auto'>
            <Avatar className='image avatar'>
              {!item ? '' : !item.photoURL ? icon.accountGroup : (
                <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
                  <img alt='avatar' src={item.photoURL} className='avatar thumb' />
                </Zoom>
              )}
            </Avatar>
          </div>
          <div className='col'>
            <h2 className='title flex'>{item?.title || <span className='skltn area' />}</h2>
            <div className='info-row owner flex'>
              {item ? (
                <>
                  <span className='counter'>{t('CREATED_BY')} <Link to={`/dashboard/${item.ownerUid}`}>{item.owner}</Link></span>
                  {item.moderators?.length > 1 && (
                    <button
                      type='button'
                      className='counter link'
                      onClick={onOpenModeratorsDialog}>
                      {t('MODERATORS_COUNT', { count: item.moderators.length })}
                    </button>
                  )}
                </>
              ) : <span className='skltn rows one' />}
            </div>
          </div>
        </div>

        <div className='info-row text'>
          {item ? <MinifiableText text={item.description} maxChars={500} /> : <div className='skltn rows' />}
        </div>

        {isAuth && user && (
          <div className='info-row'>
            <button 
              type='button' 
              className={classnames('btn', 'sm', follow ? 'success error-on-hover' : 'primary')} 
              onClick={onFollow} 
              disabled={!isEditor}>
              {follow ? (
                <>
                  <span className='hide-on-hover'>
                    {icon.check} {t('ACTION_FOLLOW')}
                  </span>
                  <span className='show-on-hover'>
                    {t('ACTION_STOP_FOLLOWING')}
                  </span>
                </> 
              ) : <span>{icon.plus} {t('ACTION_FOLLOW')}</span> }
            </button>
            <div className='counter inline'>
              <Bubbles limit={3} items={followers} label={t('SUBSCRIBERS')} />
            </div>
            {follow && (
              <button
                type='button'
                className='link counter last inline'
                onClick={onInvite}
                title={t('FEATURE_NOT_READY')}
                disabled>
                {t('ACTION_INVITE')}
              </button>
            )}
          </div>
        )}
      </div>

      {item?.rules && (
        <div className='card rules'>
          <h3>{t('GROUP_RULES')}</h3>
          <MinifiableText text={item.rules} maxChars={500} toggle />
        </div>
      )}

      {isAuth && isEditor && item?.edit && <DiscussionForm gid={gid} />}

      <Discussions gid={gid} />

      {isOpenEditDialog && <GroupForm id={gid} onToggle={onToggleEditDialog} />}

      {isOpenModeratorsDialog && (
        <Dialog
          className='dropdown-menu'
          open={isOpenModeratorsDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseModeratorsDialog}
          aria-labelledby='moderators-dialog-title'>
          <DialogTitle id='moderators-dialog-title'>
            {t('GROUP_MODERATORS')}
          </DialogTitle>
          <DialogContent className='content'>
            <div className='contacts-tab'>
              {groupModerators?.length ? groupModerators.map(user => (
                <div key={user.uid} className='avatar-row'>
                  <div className='row'>
                    <div className='col-auto'>
                      <Link to={`/dashboard/${user.uid}`}>
                        <Avatar className='avatar' src={user.photoURL} alt={user.displayName}>
                          {!user.photoURL && getInitials(user.displayName)}
                        </Avatar>
                      </Link>
                    </div>
                    <div className='col'>
                      <div className='row'>
                        <Link to={`/dashboard/${user.uid}`} className='col name'>{user.displayName}</Link>
                        {isEditor && (
                          <div className='col-auto'>
                            {user.uid === item?.ownerUid ? (
                              <button type='button' className='btn sm rounded flat' disabled>
                                {t('CREATOR')}
                              </button>
                            ) : (isOwner || isAdmin) && (
                              <button
                                type='button'
                                className='btn sm rounded flat'
                                data-muid={user.uid}
                                onClick={onDeleteModerator}>
                                {t('ACTION_DELETE')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : <div>{t('NO_MODERATORS')}</div>}
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
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>
            {t('DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              {t('DIALOG_REMOVE_GROUP_PARAGRAPH')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('ACTION_DELETE')}</button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Group;