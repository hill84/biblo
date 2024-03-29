import type { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import type { TransitionProps } from '@material-ui/core/transitions';
import classnames from 'classnames';
import type { FC, ReactElement, Ref } from 'react';
import { forwardRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { notesRef, reviewerCommentersRef, reviewerRef, userBookRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, normURL, timeSince, truncateString } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import type { CommentModel, ReviewModel, UserContextModel } from '../types';
import Comment from './comment';
import Cover from './cover';
import FlagDialog from './flagDialog';
import CommentForm from './forms/commentForm';
import MinifiableText from './minifiableText';
import Rating from './rating';

let reviewerCommentersFetch: (() => void) | undefined;

const Transition = forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

const limit = 20;

interface ReviewProps {
  bid?: string;
  review: ReviewModel;
  uid?: string;
}

const Review: FC<ReviewProps> = ({
  bid,
  review,
  uid
}: ReviewProps) => {
  const { isAdmin, isEditor, user } = useContext<UserContextModel>(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const authid: string = user?.uid || '';
  const likes_num = review.likes ? review.likes.length : 0;
  // const dislikes_num = review.dislikes ? review.dislikes.length : 0;
  const [flagLoading, setFlagLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRid, setSelectedRid] = useState<string>('');
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState<boolean>(false);
  const [isEditingComment, setIsEditingComment] = useState<boolean>(false);
  const [like, setLike] = useState<boolean>(likes_num && user?.uid && review.likes.indexOf(user?.uid) > -1 ? true : false || false);

  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (bid && selectedRid) {
      setLoading(true);
      reviewerCommentersFetch = reviewerCommentersRef(bid, selectedRid).orderBy('created_num', 'asc').limit(limit).onSnapshot((snap: DocumentData): void => {
        if (!snap.empty) {
          const items: CommentModel[] = [];
          snap.forEach((item: DocumentData): number => items.push(item.data()));
          setComments(items);
          setLoading(false);
        } else {
          setComments([]);
          setLoading(false);
        }
      }, err => {
        openSnackbar(err.message, 'error');
      });
    }
  }, [bid, selectedRid, openSnackbar]);

  useEffect(() => () => {
    reviewerCommentersFetch?.();
  }, []);

  const onThumbChange = useCallback(() => {
    let { likes } = review;

    if (user) {
      if (like) {
        likes = likes.filter(e => e !== user.uid);
        setLike(false);
        // console.log(`User ${user.uid} remove like on review ${bid}/${review.createdByUid}`);
      } else {
        likes = [...likes, user.uid];
        setLike(true);
        // console.log(`User ${user.uid} add like on review ${bid}/${review.createdByUid}`);

        const likerURL = `/dashboard/${user.uid}`;
        const likerDisplayName: string = truncateString(user.displayName.split(' ')[0], 25);
        const bookTitle: string = truncateString(review.bookTitle, 35);
        const bookURL = `/book/${review.bid}/${normURL(review.bookTitle)}`;
        const noteMsg = `<a href='${likerURL}'>${likerDisplayName}</a> ha messo mi piace alla tua recensione del libro <a href='${bookURL}'>${bookTitle}</a>`;
        const newNoteRef: DocumentReference<DocumentData> = notesRef(review.createdByUid).doc();

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
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }
    }

    if (bid && review.createdByUid) {
      reviewerRef(bid, review.createdByUid).update({ likes }).then((): void => {
        // console.log(`Book review likes updated`);
        userBookRef(review.createdByUid, bid).update({ likes }).then((): void => {
          // console.log(`User book review likes updated`);
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid or ruid');
  }, [bid, like, openSnackbar, review, user]);

  const onFlagRequest = (): void => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = (): void => setIsOpenFlagDialog(false);

  const onFlag = useCallback((value?: string): void => {
    if (user) {
      const flag = {
        value,
        flaggedByUid: user.uid,
        flagged_num: Date.now()
      };

      if (bid && review) {
        setFlagLoading(true);
        reviewerRef(bid, review.createdByUid).update({ flag }).then((): void => {
          setFlagLoading(false);
          setIsOpenFlagDialog(false);
          openSnackbar(t('SUCCESS_ITEM_FLAGGED'), 'success');
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      } else console.warn('Cannot flag');
    }
  }, [bid, openSnackbar, review, t, user]);

  const onRemoveFlag = useCallback((): void => {
    if (bid && review && isAdmin) {
      setFlagLoading(true);
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { flag, ...rest } = review;
      reviewerRef(bid, review.createdByUid).set(rest).then((): void => {
        setFlagLoading(false);
        openSnackbar(t('SUCCESS_FLAG_REMOVED'), 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('Cannot remove flag');
  }, [bid, isAdmin, openSnackbar, t, review]);

  const onDeleteRequest = (): void => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = (): void => setIsOpenDeleteDialog(false);

  const onDelete = (): void => {
    setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {
      reviewerRef(bid, review.createdByUid).delete().then((): void => {
        // console.log(`Book review deleted`);
        userBookRef(review.createdByUid, bid).update({ review: {} }).then(() => {
          // console.log(`User review deleted`);
          openSnackbar(t('SUCCESS_DELETED_ITEM'), 'success');
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No bid');
  };

  const onToggleCommentsPanel = (): void => setSelectedRid((s: string): string => s === review.createdByUid ? '' : review.createdByUid);

  const onEditComment = (): void => setIsEditingComment(true);

  const onCancelComment = (): void => setIsEditingComment(false);

  // const onCloseCommentsPanel = (): void => setSelectedRid('');

  const isOwner = useMemo((): boolean => review.createdByUid === user?.uid, [review.createdByUid, user]);
  const flaggedByUser = useMemo((): boolean => (review.flag?.flaggedByUid) === user?.uid, [review.flag?.flaggedByUid, user?.uid]);
  const commentList = useMemo((): CommentModel[] => comments?.filter(item => isEditingComment ? item.createdByUid !== authid : item), [comments, isEditingComment, authid]);
  const selected = useMemo((): boolean => Boolean(selectedRid) && selectedRid === review.createdByUid, [review.createdByUid, selectedRid]);

  return (
    <>
      <div className={classnames(isOwner ? 'own review' : 'review', { [`flagged ${review.flag?.value}`]: review.flag })} id={review.createdByUid}>
        <div className='row'>
          <div className='col-auto left'>
            {!bid ? (
              <Link to={`/book/${review.bid}/${normURL(review.bookTitle)}`} className='hoverable-items'>
                <Cover info={false} book={{
                  bid: review.bid,
                  title: review.bookTitle,
                  authors: { 'author': true },
                  covers: review.covers,
                  publisher: 'publisher'
                }} />
                {!uid && (
                  <Avatar className='avatar absolute' src={review.photoURL} alt={review.displayName}>
                    {!review.photoURL && getInitials(review.displayName)}
                  </Avatar>
                )}
              </Link>
            ) : (
              <Link to={`/dashboard/${review.createdByUid}`}>
                <Avatar className='avatar' src={review.photoURL} alt={review.displayName}>
                  {!review.photoURL && getInitials(review.displayName)}
                </Avatar>
              </Link>
            )}
          </div>
          <div className='col right'>
            <div className='head row'>
              <Link to={uid ? `/book/${review.bid}/${normURL(review.bookTitle)}` : `/dashboard/${review.createdByUid}`} className='col author'>
                <h3>
                  {uid ? review.bookTitle : review.displayName}
                  {/* isOwner && <span className='badge'>TU</span> */}
                  {!bid && <span className='date'>{timeSince(review.created_num)}</span>}
                </h3>
              </Link>

              {review.rating_num > 0 && (
                <div className='col-auto text-right'>
                  <Rating ratings={{ rating_num: review.rating_num }} labels />
                </div>
              )}
            </div>
            {review.title && <h4 className='title'>{review.title}</h4>}
            <div className='info-row text'>
              <MinifiableText text={review.text} maxChars={500} />
            </div>
            {bid && (
              <div className='foot row'>
                <div className='col-auto likes'>
                  <div className='counter'>
                    <Tooltip title={t(like ? 'ACTION_DISLIKE' : 'ACTION_LIKE')}>
                      <span>
                        <button
                          type='button'
                          className={classnames('btn', 'flat', 'thumb', 'up', like)}
                          disabled={!isEditor || isOwner}
                          onClick={onThumbChange}>
                          {icon.thumbUp} {abbrNum(likes_num)}
                        </button>
                      </span>
                    </Tooltip>
                  </div>
                  {/*
                    <div className='counter'>
                      <Tooltip title={dislike ? 'Annulla non mi piace' : 'Non mi piace'}>
                        <span>
                          <button
                            type='button'
                            className={classnames('btn', 'flat', 'thumb', 'down', dislike)}
                            disabled={!isEditor || isOwner}
                            onClick={onThumbChange}>
                            {icon.thumbDown} {abbrNum(dislikes_num)}
                          </button>
                        </span>
                      </Tooltip>
                    </div>
                  */}
                  {isEditor && (!isOwner || review.comments_num > 0) && (
                    <div className='counter'>
                      <button type='button' className='btn sm flat' onClick={onEditComment} disabled={isEditingComment}>
                        <span className='show-sm'>{icon.pencil}</span> <span className='hide-sm'>{t('ACTION_REPLY')}</span>
                      </button>
                    </div>
                  )}
                  {review.comments_num > 0 && (
                    <div className='counter'>
                      <button type='button' className='btn sm flat' onClick={onToggleCommentsPanel} disabled={isEditingComment}>
                        {selected ? icon.menuUp : icon.menuDown} {t('REPLIES_COUNT', { count: review.comments_num })}
                      </button>
                    </div>
                  )}
                  {isEditor && !isOwner && isAdmin && flaggedByUser && (
                    <div className='counter'>
                      <Tooltip title='Rimuovi segnalazione'>
                        <button type='button' className='btn sm flat' onClick={onRemoveFlag}>{icon.flag}</button>
                      </Tooltip>
                    </div>
                  )}
                  {isEditor && !isOwner && !flaggedByUser && (
                    <div className='counter show-on-hover'>
                      <button type='button' className='btn sm flat' onClick={onFlagRequest} disabled={flaggedByUser}>
                        <span className='show-sm'>{icon.flag}</span> <span className='hide-sm'>{t('ACTION_FLAG')}</span>
                      </button>
                    </div>
                  )}
                  {isEditor && (isOwner || isAdmin) && (
                    <div className='counter show-on-hover'>
                      <button type='button' className='btn sm flat' onClick={onDeleteRequest}>
                        <span className='show-sm'>{icon.delete}</span> <span className='hide-sm'>{t('ACTION_DELETE')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className='col counter text-right date'>
                  {review.lastEdit_num && (
                    <span className='hide-xs' title={`${t('EDITED_female')} ${timeSince(review.lastEdit_num)}`}>
                      {review.lastEdit_num && (review.created_num !== review.lastEdit_num) && `(${t('EDITED_female').toLowerCase()})`}
                    </span>
                  )} {timeSince(review.created_num)}
                </div>
              </div>
            )}
            {isEditingComment && bid && (
              <CommentForm
                bid={bid}
                bookTitle={review.bookTitle}
                rid={review.createdByUid}
                onCancel={onCancelComment}
              />
            )}
            {selectedRid && selectedRid === review.createdByUid && commentList && (
              <div className='comments'>
                {loading ? (
                  <div className='skltn comment' />
                ) : (
                  commentList.map(item => (
                    bid && (
                      <Comment
                        key={item.created_num}
                        bid={bid}
                        reviewerDisplayName={review.displayName}
                        rid={review.createdByUid}
                        comment={item}
                        onEdit={onEditComment}
                      />
                    )
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
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>
            {t('DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              {t('DIALOG_REMOVE_REVIEW_PARAGRAPH')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('ACTION_DELETE')}</button>
          </DialogActions>
        </Dialog>
      )}

      {isOpenFlagDialog && (
        <FlagDialog
          loading={flagLoading}
          open={isOpenFlagDialog}
          onClose={onCloseFlagDialog}
          onFlag={onFlag}
          value={flaggedByUser ? review.flag?.value : ''}
        />
      )}
    </>
  );
};

export default Review;