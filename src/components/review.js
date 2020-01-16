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
import CommentForm from '../components/forms/commentForm';
import { notesRef, reviewerCommentersRef, reviewerRef, userBookRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, hasRole, normURL, timeSince, truncateString } from '../config/shared';
import { reviewType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import Comment from './comment';
import Cover from './cover';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';
import Rating from './rating';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const limit = 20;

const Review = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const authid = useMemo(() => user && user.uid, [user]);
  const { bid, review, uid } = props;
  const likes_num = review.likes ? review.likes.length : 0;
  // const dislikes_num = review.dislikes ? review.dislikes.length : 0;
  const [flagLoading, setFlagLoading] = useState(false);
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRid, setSelectedRid] = useState(null);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [like, setLike] = useState(likes_num && review.likes.indexOf(user && user.uid) > -1 ? true : false || false);
  const is = useRef(true);

  useEffect(() => {
    if (bid && selectedRid) {
      if (is.current) setLoading(true);

      reviewerCommentersRef(bid, selectedRid).limit(limit).onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          setComments(items);
          setLoading(false);
        } else {
          setComments(null);
          setLoading(false);
        }
      });
    }
  }, [bid, selectedRid, openSnackbar]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onThumbChange = useCallback(() => {
    let { likes } = review;
    
    if (user) {
      if (like) {
        likes = likes.filter(e => e !== user.uid);
        if (is.current) {
          setLike(false);
        }
        // console.log(`User ${user.uid} remove like on review ${bid}/${review.createdByUid}`);
      } else {
        likes = [...likes, user.uid];
        if (is.current) {
          setLike(true);
        }
        // console.log(`User ${user.uid} add like on review ${bid}/${review.createdByUid}`);

        const likerDisplayName = truncateString(user.displayName.split(' ')[0], 12);
        const noteMsg = `<a href="/dashboard/${user.uid}">${likerDisplayName}</a> ha messo mi piace alla tua recensione del libro <a href="/book/${review.bid}/${normURL(review.bookTitle)}">${truncateString(review.bookTitle, 35)}</a>`;
        const newNoteRef = notesRef(review.createdByUid).doc();
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: Date.now(),
          createdBy: user.displayName,
          createdByUid: user.uid,
          photoURL: user.photoURL,
          tag: ['like'],
          read: false,
          uid: review.createdByUid
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    }

    if (bid && review.createdByUid) {
      reviewerRef(bid, review.createdByUid).update({ likes }).then(() => {
        // console.log(`Book review likes updated`);
        userBookRef(review.createdByUid, bid).update({ likes }).then(() => {
          // console.log(`User book review likes updated`);
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid or ruid');
  }, [bid, like, openSnackbar, review, user]);

  const onFlagRequest = () => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = () => setIsOpenFlagDialog(false);

  const onFlag = useCallback(value => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: Date.now()
      };
  
      if (bid && review && user) {
        if (is.current) setFlagLoading(true);
        reviewerRef(bid, review.createdByUid).update({ flag }).then(() => {
          if (is.current) {
            setFlagLoading(false);
            setIsOpenFlagDialog(false);
            openSnackbar('Recensione segnalata agli amministratori', 'success');
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn('Cannot flag');
    }
  }, [bid, openSnackbar, review, user]);

  const onDeleteRequest = () => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = () => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {
      reviewerRef(bid, review.createdByUid).delete().then(() => {
        // console.log(`Book review deleted`);
        userBookRef(review.createdByUid, bid).update({ review: {} }).then(() => {
          // console.log(`User review deleted`);
          openSnackbar('Recensione cancellata', 'success');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn(`No bid`);
  };

  const onToggleCommentsPanel = () => setSelectedRid(s => s === review.createdByUid ? null : review.createdByUid);

  const onEditComment = () => {
    if (is.current) setIsEditingComment(true);
  };

  const onCancelComment = () => {
    if (is.current) setIsEditingComment(false);
  };

  // const onCloseCommentsPanel = () => setSelectedRid(null);

  const isOwner = useMemo(() => review.createdByUid === (user && user.uid), [review.createdByUid, user]);
  const isAdmin = useMemo(() => hasRole(user, 'admin'), [user]);
  const isEditor = useMemo(() => hasRole(user, 'editor'), [user]);
  const flaggedByUser = useMemo(() => (review.flag && review.flag.flaggedByUid) === (user && user.uid), [review.flag, user]);
  const commentList = useMemo(() => comments && comments.filter(item => isEditingComment ? item.createdByUid !== authid : item), [comments, isEditingComment, authid]);
  const classNames = useMemo(() => `${isOwner ? 'own review' : 'review'} ${review.flag ? `flagged ${review.flag.value}` : ''}`, [isOwner, review]);
  const selected = useMemo(() => selectedRid && selectedRid === review.createdByUid, [review.createdByUid, selectedRid]);

  return (
    <>
      <div className={classNames} id={review.createdByUid} ref={is}>
        <div className="row">
          <div className="col-auto left">
            {!bid ?
              <Link to={`/book/${review.bid}/${normURL(review.bookTitle)}`} className="hoverable-items">
                <Cover info={false} book={{
                  bid: review.bid,
                  title: review.bookTitle,
                  authors: { 'author': true },
                  covers: review.covers,
                  publisher: 'publisher'
                }} />
                {!uid && <Avatar className="avatar absolute" src={review.photoURL} alt={review.displayName}>{!review.photoURL && getInitials(review.displayName)}</Avatar>}
              </Link>
            :
              <Link to={`/dashboard/${review.createdByUid}`}>
                <Avatar className="avatar" src={review.photoURL} alt={review.displayName}>{!review.photoURL && getInitials(review.displayName)}</Avatar>
              </Link>
            }
          </div>
          <div className="col right">
            <div className="head row">
              <Link to={uid ? `/book/${review.bid}/${normURL(review.bookTitle)}` : `/dashboard/${review.createdByUid}`} className="col author">
                <h3>
                  {uid ? review.bookTitle : review.displayName}
                  {/* isOwner && <span className="badge">TU</span> */}
                  {!bid && <span className="date">{timeSince(review.created_num)}</span>}
                </h3>
              </Link>
              
              {review.rating_num > 0 && 
                <div className="col-auto text-right">
                  <Rating ratings={{rating_num: review.rating_num}} labels />
                </div>
              }
            </div>
            {review.title && <h4 className="title">{review.title}</h4>}
            <div className="info-row text">
              <MinifiableText text={review.text} maxChars={500} />
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
                      <Tooltip title={dislike ? 'Annulla non mi piace' : 'Non mi piace'}>
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
                    <div className="counter">
                      <button type="button" className="btn sm flat" onClick={onEditComment} disabled={isEditingComment}>
                        <span className="show-sm">{icon.pencil}</span> <span className="hide-sm">Rispondi</span>
                      </button>
                    </div>
                  )}
                  {review.comments_num > 0 && (
                    <div className="counter">
                      <button type="button" className="btn sm flat" onClick={onToggleCommentsPanel} disabled={isEditingComment}>
                        {selected ? (
                          <>
                            <span className="hide-sm">Nascondi</span>
                            <span className="show-sm">{icon.menuUp}</span>
                          </>
                        ) : (
                          <>
                            <span className="hide-sm">Visualizza</span>
                            <span className="show-sm">{icon.menuDown}</span>
                          </>
                        )} {`${review.comments_num} rispost${review.comments_num > 1 ? 'e' : 'a'}`}
                      </button>
                    </div>
                  )}
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
                <div className="col counter text-right date">{timeSince(review.created_num)}</div>
              </div>
            }
            {isEditingComment && (
              <CommentForm
                bid={bid}
                bookTitle={review.bookTitle}
                rid={review.createdByUid}
                onCancel={onCancelComment}
              />
            )}
            {selectedRid && selectedRid === review.createdByUid && commentList && (
              <div className="comments">
                {loading ? (
                  <div className="skltn comment" />
                ) : (
                  commentList.map(item => (
                    <Comment
                      key={item.created_num}
                      bid={bid}
                      rid={review.createdByUid}
                      comment={item}
                      onEdit={onEditComment}
                    />
                  ))
                )}
              </div>
            )}
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
              Cancellando la recensione perderai tutti i like e i commenti ricevuti.
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
          value={flaggedByUser ? review.flag && review.flag.value : ''}
        />
      )}
    </>
  );
}

Review.propTypes = {
  bid: stringType,
  review: reviewType.isRequired,
  uid: stringType
}

Review.defaultProps = {
  bid: null,
  uid: null
}

export default Review;