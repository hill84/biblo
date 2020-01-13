import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notesRef, reviewerCommenterRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, hasRole, normURL, timeSince, timestamp, truncateString } from '../config/shared';
import { commentType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const Comment = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, comment, rid } = props;
  const [flagLoading, setFlagLoading] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState(false);
  const [like, setLike] = useState(comment.likes.length && comment.likes.indexOf(user && user.uid) > -1 ? true : false || false);
  const [likes_num, setLikes_num] = useState(comment.likes.length || 0);
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onThumbChange = useCallback(() => {
    let { likes } = comment;
    
    if (user) {
      if (like) {
        likes = likes.filter(e => e !== user.uid);
        if (is.current) {
          setLike(false);
          setLikes_num(likes.length);
        }
        // console.log(`User ${user.uid} remove like on comment ${bid}/${comment.createdByUid}`);
        // console.log(`User likes decreased to ${likes.length}`);
      } else {
        likes = [...likes, user.uid];
        if (is.current) {
          setLike(true);
          setLikes_num(likes.length);
        }
        // console.log(`User ${user.uid} add like on comment ${bid}/${comment.createdByUid}`);
        // console.log(`User likes increased to ${likes.length}`);

        const likerURL = `/dashboard/${user.uid}`;
        const likerDisplayName = truncateString(user.displayName.split(' ')[0], 12);
        const reviewerURL = `/dashboard/${comment.reviewerUid}`;
        const reviewerDisplayName = truncateString(comment.reviewerDisplayName.split(' ')[0], 12);
        const bookTitle = truncateString(comment.bookTitle, 35);
        const bookURL = `/book/${comment.bid}/${normURL(comment.bookTitle)}`;
        const noteMsg = `<a href="${likerURL}">${likerDisplayName}</a> ha messo mi piace al tuo commento alla recensione di <a href="${reviewerURL}">${reviewerDisplayName}</a> del libro <a href="${bookURL}">${bookTitle}</a>`;
        const newNoteRef = notesRef(comment.createdByUid).doc();
        
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: timestamp,
          createdBy: user.displayName,
          createdByUid: user.uid,
          photoURL: user.photoURL,
          tag: ['like'],
          read: false,
          uid: comment.createdByUid
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    }
    // console.log({likes, 'likes_num': likes.length});
    if (bid && comment.createdByUid && rid) {
      reviewerCommenterRef(bid, rid, comment.createdByUid).update({ likes }).then(() => {
        // console.log(`Review comment likes updated`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid or cid');
  }, [bid, comment, like, openSnackbar, rid, user]);

  const onFlagRequest = () => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = () => setIsOpenFlagDialog(false);

  const onFlag = useCallback(value => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: timestamp
      };
  
      if (bid && comment && rid) {
        if (is.current) setFlagLoading(true);
        reviewerCommenterRef(bid, rid, comment.createdByUid).update({ flag }).then(() => {
          if (is.current) {
            setFlagLoading(false);
            setIsOpenFlagDialog(false);
            openSnackbar('Commento segnalato agli amministratori', 'success');
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn('Cannot flag');
    }
  }, [bid, comment, openSnackbar, rid, user]);

  const onDeleteRequest = () => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = () => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {
      reviewerCommenterRef(bid, rid, comment.createdByUid).delete().then(() => {
        // console.log(`Book review deleted`);
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn(`No bid`);
  };

  const isOwner = useMemo(() => comment.createdByUid === (user && user.uid), [comment, user]);
  const isAdmin = useMemo(() => hasRole(user, 'admin'), [user]);
  const isEditor = useMemo(() => hasRole(user, 'editor'), [user]);
  const flaggedByUser = useMemo(() => (comment.flag && comment.flag.flaggedByUid) === (user && user.uid), [comment, user]);

  return (
    <>
      <div className={`${isOwner ? 'own comment' : 'comment'} ${comment.flag ? `flagged ${comment.flag.value}` : ''}`} ref={is}>
        <div className="row">
          <div className="col-auto left">
            <Link to={`/dashboard/${comment.createdByUid}`}>
              <Avatar className="avatar" src={comment.photoURL} alt={comment.displayName}>{!comment.photoURL && getInitials(comment.displayName)}</Avatar>
            </Link>
          </div>
          <div className="col right">
            <div className="head row">
              <Link to={rid ? `/book/${comment.bid}/${normURL(comment.bookTitle)}` : `/dashboard/${comment.createdByUid}`} className="col-auto author">
                <h3>
                  {rid ? comment.bookTitle : comment.displayName}
                  {/* isOwner && <span className="badge">TU</span> */}
                  {!bid && <span className="date">{timeSince(comment.created_num)}</span>}
                </h3>
              </Link>
            </div>
            <div className="info-row text">
              <MinifiableText text={comment.text} maxChars={500} />
            </div>
            {bid && 
              <div className="foot row">
                <div className="col-auto likes">
                  <div className="counter">
                    <Tooltip title={like ? 'Annulla mi piace' : 'Mi piace'}>
                      <span>
                        <button 
                          type="button"
                          className={`btn flat thumb up ${like}`} 
                          disabled={!isEditor || isOwner} 
                          onClick={onThumbChange}>
                          {icon.thumbUp} {abbrNum(likes_num)}
                        </button>
                      </span>
                    </Tooltip>
                  </div>
                  {/* 
                    <div className="counter">
                      <Tooltip title={dislike ? 'Annulla mi piace' : 'Mi piace'}>
                        <span>
                          <button 
                            type="button"
                            className={`btn flat thumb down ${dislike}`} 
                            disabled={!isEditor || isOwner} 
                            onClick={onThumbChange}>
                            {icon.thumbDown} {abbrNum(dislikes_num)}
                          </button>
                        </span>
                      </Tooltip>
                    </div> 
                  */}
                  {isEditor && !isOwner && (
                    <>
                      <div className="counter show-on-hover">
                        <button type="button" className="btn sm flat" onClick={onFlagRequest} disabled={flaggedByUser}>
                          <span className="show-sm">{icon.flag}</span> <span className="hide-sm">Segnala{flaggedByUser ? 'ta' : ''}</span>
                        </button>
                      </div>
                    </>
                  )}
                  {isEditor && (isOwner || isAdmin) && (
                    <div className="counter show-on-hover">
                      <button type="button" className="btn sm flat" onClick={onDeleteRequest}>
                        <span className="show-sm">{icon.delete}</span> <span className="hide-sm">Elimina</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="col counter text-right date">{timeSince(comment.created_num)}</div>
              </div>
            }
          </div>
        </div>
      </div>

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
              Cancellando il commento perderai tutti i like ricevuti.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer flex no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={onDelete}>Elimina</button>
          </DialogActions>
        </Dialog>
      )}

      {isOpenFlagDialog && (
        <FlagDialog 
          loading={flagLoading}
          open={isOpenFlagDialog} 
          onClose={onCloseFlagDialog} 
          onFlag={onFlag} 
          TransitionComponent={Transition} 
          value={flaggedByUser ? comment.flag && comment.flag.value : ''}
        />
      )}
    </>
  );
}

Comment.propTypes = {
  bid: stringType.isRequired,
  comment: commentType.isRequired,
  rid: stringType.isRequired
}

export default Comment;