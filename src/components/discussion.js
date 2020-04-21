import Avatar from '@material-ui/core/Avatar';
import Grow from '@material-ui/core/Grow';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionRef } from '../config/firebase';
import icon from '../config/icons';
import { getInitials, handleFirestoreError, isToday, timeSince } from '../config/shared';
import { discussionType, stringType } from '../config/types';
import GroupContext from '../context/groupContext';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const Discussion = props => {
  const { isAdmin, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { discussion, gid } = props;
  const { 
    isOwner: isGroupOwner, 
    isModerator: isGroupModerator, 
    moderatorsList,
    ownerUid: groupOwner
  } = useContext(GroupContext);
  const [flagLoading, setFlagLoading] = useState(false);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState(false);
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onFlagRequest = () => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = () => setIsOpenFlagDialog(false);

  const onFlag = useCallback(value => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: Date.now()
      };
  
      if (is.current) setFlagLoading(true);
      groupDiscussionRef(gid, discussion.did).update({ flag }).then(() => {
        if (is.current) {
          setFlagLoading(false);
          setIsOpenFlagDialog(false);
          openSnackbar('Discussione segnalata agli amministratori', 'success');
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  }, [gid, openSnackbar, discussion, user]);

  const onRemoveFlag = useCallback(() => {
    if (isAdmin) {
      if (is.current) setFlagLoading(true);
      const { flag, ...rest } = discussion;
      groupDiscussionRef(gid, discussion.did).set(rest).then(() => {
        if (is.current) {
          setFlagLoading(false);
          openSnackbar('Segnalazione rimossa', 'success');
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('Cannot remove flag');
  }, [gid, isAdmin, openSnackbar, discussion]);

  const onDelete = () => {
    groupDiscussionRef(gid, discussion.did).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  };

  const onOpenActionsMenu = e => setActionsAnchorEl(e.currentTarget);

  const onCloseActionsMenu = () => setActionsAnchorEl(null);

  const isOwner = useMemo(() => discussion.createdByUid === user?.uid, [discussion.createdByUid, user]);
  const flaggedByUser = useMemo(() => (discussion.flag && discussion.flag.flaggedByUid) === user?.uid, [discussion.flag, user]);
  const classNames = useMemo(() => `${isOwner ? 'own discussion' : 'discussion'} ${discussion.flag ? `flagged ${discussion.flag.value}` : ''}`, [isOwner, discussion]);

  return (
    <>
      <div className={classNames} id={discussion.did} ref={is}>
        <div className="row">
          <div className="col-auto left">
            <Link to={`/dashboard/${discussion.createdByUid}`}>
              <Avatar className="avatar" src={discussion.photoURL} alt={discussion.displayName}>
                {!discussion.photoURL && getInitials(discussion.displayName)}
              </Avatar>
            </Link>
          </div>
          <div className="col right">
            <div className="head row">
              <Link to={`/dashboard/${discussion.createdByUid}`} className="col author">
                <h3>
                  {discussion.displayName} {moderatorsList?.some(uid => uid === discussion.createdByUid) && (
                    <span className="text-sm text-regular lighter-text hide-sm">({discussion.createdByUid === groupOwner ? 'creatore' : 'moderatore'})</span>
                  )}
                </h3>
              </Link>

              <div className="col-auto text-right counter last date hide-xs">
                {isToday(discussion.created_num) ? timeSince(discussion.created_num) : new Date(discussion.created_num).toLocaleDateString()}
              </div>

              {isEditor && (
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn sm flat rounded icon"
                    onClick={actionsAnchorEl ? onCloseActionsMenu : onOpenActionsMenu}>
                    {actionsAnchorEl ? icon.close : icon.dotsVertical}
                  </button>
                  <Menu
                    id="actions-menu"
                    className="dropdown-menu"
                    anchorEl={actionsAnchorEl}
                    onClick={onCloseActionsMenu}
                    open={Boolean(actionsAnchorEl)}
                    onClose={onCloseActionsMenu}>
                    {!isOwner && <MenuItem onClick={onFlagRequest} disabled={flaggedByUser}>Segnala</MenuItem>}
                    {!isOwner && isAdmin && flaggedByUser && <MenuItem onClick={onRemoveFlag}>Rimuovi segnalazione</MenuItem>}
                    {(isOwner || isAdmin || isGroupModerator || isGroupOwner) && <MenuItem onClick={onDelete}>Elimina</MenuItem>}
                  </Menu>
                </div>
              )}
            </div>
            <div className="info-row text">
              <MinifiableText text={discussion.text} maxChars={500} rich />
            </div>
          </div>
        </div>
      </div>

      {isOpenFlagDialog && (
        <FlagDialog 
          loading={flagLoading}
          open={isOpenFlagDialog}
          onClose={onCloseFlagDialog}
          onFlag={onFlag}
          TransitionComponent={Transition}
          value={flaggedByUser ? discussion.flag?.value : ''}
        />
      )}
    </>
  );
}

Discussion.propTypes = {
  discussion: discussionType.isRequired,
  gid: stringType
}

Discussion.defaultProps = {
  gid: null
}

export default Discussion;