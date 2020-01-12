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
import { notesRef, reviewerRef, userBookRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, hasRole, normURL, timeSince, timestamp, truncateString } from '../config/shared';
import { reviewType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import Cover from './cover';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';
import Rating from './rating';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const Review = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, review, uid } = props;
  const [flagLoading, setFlagLoading] = useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState(false);
  const [like, setLike] = useState(review.likes.length && review.likes.indexOf(user && user.uid) > -1 ? true : false || false);
  const [likes_num, setLikes_num] = useState(review.likes.length || 0);
  const is = useRef(true);

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
          setLikes_num(likes.length);
        }
        // console.log(`User ${user.uid} remove like on review ${bid}/${review.createdByUid}`);
        // console.log(`User likes decreased to ${likes.length}`);
      } else {
        likes = [...likes, user.uid];
        if (is.current) {
          setLike(true);
          setLikes_num(likes.length);
        }
        // console.log(`User ${user.uid} add like on review ${bid}/${review.createdByUid}`);
        // console.log(`User likes increased to ${likes.length}`);

        const likerDisplayName = truncateString(user.displayName.split(' ')[0], 12);
        const noteMsg = `<a href="/dashboard/${user.uid}">${likerDisplayName}</a> ha messo mi piace alla tua recensione del libro <a href="/book/${review.bid}/${normURL(review.bookTitle)}">${truncateString(review.bookTitle, 35)}</a>`;
        const newNoteRef = notesRef(review.createdByUid).doc();
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: timestamp,
          createdBy: user.displayName,
          createdByUid: user.uid,
          photoURL: user.photoURL,
          tag: ['like'],
          read: false,
          uid: review.createdByUid
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    }
    // console.log({likes, 'likes_num': likes.length});
    if (bid && review.createdByUid) {
      reviewerRef(bid, review.createdByUid).update({ likes }).then(() => {
        // console.log(`Book review likes updated`);
        userBookRef(review.createdByUid, bid).update({ likes }).then(() => {
          // console.log(`User book review likes updated`);
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid or ruid');
  }, [bid, like, openSnackbar, review, user]);

  // const onAddResponse = () => {} // TODO

  // const onSubmitResponse = () => {} // TODO

  const onFlagRequest = () => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = () => setIsOpenFlagDialog(false);

  const onFlag = useCallback(value => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: timestamp
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

  const isOwner = useMemo(() => review.createdByUid === (user && user.uid), [review, user]);
  const isAdmin = useMemo(() => hasRole(user, 'admin'), [user]);
  const isEditor = useMemo(() => hasRole(user, 'editor'), [user]);
  const flaggedByUser = useMemo(() => (review.flag && review.flag.flaggedByUid) === (user && user.uid), [review, user]);

  return (
    <>
      <div className={`${isOwner ? 'own review' : 'review'} ${(isAdmin || flaggedByUser) && review.flag ? `flagged ${review.flag.value}` : ''}`} ref={is}>
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
              <Link to={uid ? `/book/${review.bid}/${normURL(review.bookTitle)}` : `/dashboard/${review.createdByUid}`} className="col-auto author">
                <h3>
                  {uid ? review.bookTitle : review.displayName}
                  {/* isOwner && <span className="badge">TU</span> */}
                  {!bid && <span className="date">{timeSince(review.created_num)}</span>}
                </h3>
              </Link>
              
              {review.rating_num > 0 && 
                <div className="col text-right">
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
                  {isEditor && !isOwner && 
                    <>
                      {/* <div className="counter">
                        <button type="button" className="btn sm flat" disabled onClick={onAddResponse}>
                          <span className="show-sm">{icon.pencil}</span> <span className="hide-sm">Rispondi</span>
                        </button>
                      </div> */}
                      <div className="counter show-on-hover">
                        <button type="button" className="btn sm flat" onClick={onFlagRequest} disabled={flaggedByUser}>
                          <span className="show-sm">{icon.flag}</span> <span className="hide-sm">Segnala{flaggedByUser ? 'ta' : ''}</span>
                        </button>
                      </div>
                    </>
                  }
                  {isEditor && (isOwner || isAdmin) && 
                    <div className="counter show-on-hover">
                      <button type="button" className="btn sm flat" onClick={onDeleteRequest}>
                        <span className="show-sm">{icon.delete}</span> <span className="hide-sm">Elimina</span>
                      </button>
                    </div>
                  }
                </div>
                <div className="col counter text-right date">{timeSince(review.created_num)}</div>
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