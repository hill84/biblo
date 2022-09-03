import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Grow from '@material-ui/core/Grow';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import React, { forwardRef, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { notesRef, reviewerCommenterRef } from '../config/firebase';
import icon from '../config/icons';
import { commentType, funcType, stringType } from '../config/proptypes';
import { abbrNum, getInitials, handleFirestoreError, normURL, timeSince, truncateString } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import FlagDialog from './flagDialog';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} />);

Transition.displayName = 'Transition';

const Comment = ({ bid, comment, onEdit, reviewerDisplayName, rid }) => {
  const { isAdmin, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const likes_num = comment.likes ? comment.likes.length : 0;
  // const dislikes_num = comment.dislikes ? comment.dislikes.length : 0;
  const [flagLoading, setFlagLoading] = useState(false);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState(false);
  const [like, setLike] = useState(likes_num && comment.likes.indexOf(user?.uid) > -1 ? true : false || false);

  const { t } = useTranslation(['common']);

  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onThumbChange = useCallback(() => {
    let { likes } = comment;
    
    if (user) {
      if (like) {
        likes = likes.filter(e => e !== user.uid);
        if (is.current) setLike(false);
        // console.log(`User ${user.uid} remove like on comment ${bid}/${comment.createdByUid}`);
      } else {
        likes = [...likes, user.uid];
        if (is.current) setLike(true);
        // console.log(`User ${user.uid} add like on comment ${bid}/${comment.createdByUid}`);

        const likerURL = `/dashboard/${user.uid}`;
        const likerDisplayName = truncateString(user.displayName.split(' ')[0], 25);
        const reviewerURL = `/dashboard/${rid}`;
        const reviewer = truncateString(reviewerDisplayName.split(' ')[0], 25);
        const bookTitle = truncateString(comment.bookTitle, 35);
        const bookURL = `/book/${bid}/${normURL(comment.bookTitle)}`;
        const isLikerReviewer = user.uid === rid;
        const noteMsg = `<a href="${likerURL}">${likerDisplayName}</a> ha messo mi piace alla tua risposta alla ${isLikerReviewer ? 'sua recensione' : `recensione di <a href="${reviewerURL}">${reviewer}</a>`} del libro <a href="${bookURL}">${bookTitle}</a>`;
        const newNoteRef = notesRef(comment.createdByUid).doc();
        
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: Date.now(),
          createdBy: user.displayName,
          createdByUid: user.uid,
          photoURL: user.photoURL,
          tag: ['like'],
          read: false,
          uid: comment.createdByUid
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    }

    if (bid && comment.createdByUid && rid) {
      reviewerCommenterRef(bid, rid, comment.createdByUid).update({ likes }).then(() => {
        // console.log(`Comment likes updated`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid or cid');
  }, [bid, comment, like, openSnackbar, reviewerDisplayName, rid, user]);

  const onFlagRequest = () => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = () => setIsOpenFlagDialog(false);

  const onFlag = useCallback(value => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: Date.now()
      };
  
      if (bid && comment && rid) {
        if (is.current) setFlagLoading(true);
        reviewerCommenterRef(bid, rid, comment.createdByUid).update({ flag }).then(() => {
          if (is.current) {
            setFlagLoading(false);
            setIsOpenFlagDialog(false);
            openSnackbar(t('SUCCESS_ITEM_FLAGGED'), 'success');
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn('Cannot flag');
    }
  }, [bid, comment, openSnackbar, rid, t, user]);

  const onRemoveFlag = useCallback(() => {
    if (bid && comment && rid && isAdmin) {
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { flag, ...rest } = comment;
      if (is.current) setFlagLoading(true);
      reviewerCommenterRef(bid, rid, comment.createdByUid).set(rest).then(() => {
        if (is.current) {
          setFlagLoading(false);
          openSnackbar(t('SUCCESS_FLAG_REMOVED'), 'success');
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('Cannot remove flag');
  }, [bid, comment, isAdmin, openSnackbar, rid, t]);

  const onDelete = () => {
    if (bid) {
      reviewerCommenterRef(bid, rid, comment.createdByUid).delete().then(() => {
        // console.log(`Comment deleted`);
        openSnackbar(t('SUCCESS_DELETED_ITEM'), 'success');
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid');
  };

  const onOpenActionsMenu = e => setActionsAnchorEl(e.currentTarget);

  const onCloseActionsMenu = () => setActionsAnchorEl(null);

  const isOwner = useMemo(() => comment.createdByUid === (user?.uid), [comment, user]);
  const isReviewer = useMemo(() => comment.createdByUid === rid, [comment, rid]);
  const flaggedByUser = useMemo(() => (comment.flag?.flaggedByUid) === (user?.uid), [comment, user]);
  
  return (
    <Fragment>
      <div className={classnames(isOwner ? 'own comment' : 'comment', { [`flagged ${comment.flag?.value}`]: comment.flag })} id={`${rid}-${comment.createdByUid}`} ref={is}>
        <div className="row">
          <div className="col-auto left">
            <Link to={`/dashboard/${comment.createdByUid}`}>
              <Avatar className="avatar" src={comment.photoURL} alt={comment.displayName}>
                {!comment.photoURL && getInitials(comment.displayName)}
              </Avatar>
            </Link>
          </div>
          <div className="col right">
            <div className="head row">
              <Link to={`/dashboard/${comment.createdByUid}`} className="col author">
                <h3>{comment.displayName} {isReviewer && <span className="text-sm text-regular light-text">({t('REVIEWER')})</span>}</h3>
              </Link>
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
                    {isOwner ? <MenuItem onClick={onEdit}>{t('ACTION_EDIT')}</MenuItem> : !flaggedByUser && <MenuItem onClick={onFlagRequest}>{t('ACTION_FLAG')}</MenuItem>}
                    {(isOwner || isAdmin) && <MenuItem onClick={onDelete}>{t('ACTION_DELETE')}</MenuItem>}
                  </Menu>
                </div>
              )}
            </div>
            <div className="info-row text">{comment.text}</div>
            {bid && (
              <div className="foot row">
                <div className="col-auto likes">
                  <div className="counter">
                    <Tooltip title={t(like ? 'ACTION_DISLIKE' : 'ACTION_LIKE')}>
                      <span>
                        <button 
                          type="button"
                          className={classnames('btn', 'flat', 'thumb', 'up', like)} 
                          disabled={!isEditor || isOwner} 
                          onClick={onThumbChange}>
                          {icon.thumbUp} {abbrNum(likes_num)}
                        </button>
                      </span>
                    </Tooltip>
                  </div>
                  {/* 
                    <div className="counter">
                      <Tooltip title={dislike ? 'Annulla non mi piace' : 'Non mi piace'}>
                        <span>
                          <button 
                            type="button"
                            className={classnames('btn', 'flat', 'thumb', 'down', dislike)} 
                            disabled={!isEditor || isOwner} 
                            onClick={onThumbChange}>
                            {icon.thumbDown} {abbrNum(dislikes_num)}
                          </button>
                        </span>
                      </Tooltip>
                    </div> 
                  */}
                  {isEditor && !isOwner && isAdmin && flaggedByUser && (
                    <div className="counter">
                      <Tooltip title={t('ACTION_REMOVE_FLAG')}>
                        <button type="button" className="btn sm flat" onClick={onRemoveFlag}>{icon.flag}</button>
                      </Tooltip>
                    </div>
                  )}
                </div>
                <div className="col counter text-right date">
                  <span className="hide-xs" title={`${t('EDITED')} ${timeSince(comment.lastEdit_num)}`}>
                    {comment.lastEdit_num && (comment.created_num !== comment.lastEdit_num) && `(${t('EDITED').toLowerCase()})`}
                  </span> {timeSince(comment.created_num)}
                </div>
              </div>
            )}
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
          value={flaggedByUser ? comment.flag?.value : ''}
        />
      )}
    </Fragment>
  );
};

Comment.propTypes = {
  bid: stringType.isRequired,
  comment: commentType.isRequired,
  onEdit: funcType.isRequired,
  reviewerDisplayName: stringType.isRequired,
  rid: stringType.isRequired
};

export default Comment;