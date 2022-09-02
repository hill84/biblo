import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import classnames from 'classnames';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { forwardRef, Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { reviewerRef, userBookRef } from '../../config/firebase';
import icon from '../../config/icons';
import { stringType, userBookType } from '../../config/proptypes';
import { abbrNum, checkBadWords, extractUrls, getInitials, handleFirestoreError, join, timeSince } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/emojiMart.css';
import '../../css/reviewForm.css';
import emojiMartLocale from '../../locales/emojiMart';
import Overlay from '../overlay';
import Rating from '../rating';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} />);

Transition.displayName = 'Transition';

const EmojiPickerStyle = {
  position: 'absolute',
  top: '100%',
  marginTop: 4,
  right: 0,
  zIndex: 1,
};

const max = {
  chars: {
    text: 1500,
    title: 255
  }
};

const min = {
  chars: {
    text: 25
  }
};

const formControlStyle = { zIndex: 1, };

const ReviewForm = ({ bid, userBook }) => {
  const { user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar, snackbarIsOpen } = useContext(SnackbarContext);
  const authid = useMemo(() => user?.uid, [user]);
  const initialReviewState = useMemo(() => ({
    bid,
    bookTitle: '',
    comments_num: 0,
    covers: [],
    createdByUid: authid,
    created_num: 0,
    lastEditByUid: authid,
    lastEdit_num: Date.now(),
    displayName: '',
    likes: [],
    photoURL: '',
    rating_num: 0,
    text: '',
    title: ''
  }), [authid, bid]);
  const [review, setReview] = useState(initialReviewState);
  const [leftChars, setLeftChars] = useState({ text: null, title: null });
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenEmojiPicker, setIsOpenEmojiPicker] = useState(false);
  const [changes, setChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const { t } = useTranslation(['common', 'form']);

  const is = useRef(true);

  const fetchReview = useCallback(() => {
    reviewerRef(bid, authid).onSnapshot(snap => {
      if (is.current) setLoading(true);

      if (snap.exists) {
        if (is.current) {
          setReview({ ...initialReviewState, ...snap.data() });
        }
      } else if (is.current) {
        setReview(initialReviewState);
      }
      if (is.current) {
        setLoading(false);
        setChanges(false);
      }
    }, err => console.warn(err));
  }, [authid, bid, initialReviewState]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  useEffect(() => {
    if (isEditing && !user?.photoURL) {
      const msg = <span>Non hai <span className='hide-sm'>ancora caricato</span> una foto profilo.</span>;
      const action = <Link to='/profile' type='button' className='btn sm flat' onClick={closeSnackbar}>Aggiungila</Link>;
      openSnackbar(msg, 'info', 4000, action);
    }
  }, [closeSnackbar, isEditing, openSnackbar, user]);

  const onEditing = () => setIsEditing(true);

  const validate = useCallback(review => {
    const { text, title } = review;
    const errors = {};
    const urlMatches = extractUrls(text);
    const badWords = checkBadWords(text);

    if (!text) {
      errors.text = t('ERROR_REQUIRED_FIELD');
    } else if (text.length > max.chars.text) {
      errors.text = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.text });
    } else if (text.length < min.chars.text) {
      errors.text = t('ERROR_MIN_COUNT_CHARACTERS', { count: min.chars.text });
    } else if (urlMatches) {
      errors.text = t('ERROR_NO_LINK_STRING', { string: join(urlMatches, t('common:AND')) });
    } else if (badWords) {
      errors.text = t('ERROR_NO_VULGARITY');
    }

    if (title?.length > max.chars.title) {
      errors.title = t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.title });
    }

    return errors;
  }, [t]);

  const onSubmit = useCallback(e => {
    e.preventDefault();

    if (changes) {
      const errors = validate(review);
      if (is.current) setErrors(errors);

      if (!Object.values(errors).some(Boolean)) {
        if (is.current) setLoading(true);

        if (bid && user) {
          // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
          const { comments_num, flag, likes, ...userBookReview } = review;
          const updatedReview = {
            bookTitle: userBook.title,
            covers: userBook.covers,
            created_num: review.created_num || Date.now(),
            displayName: user.displayName,
            lastEditByUid: authid,
            lastEdit_num: Date.now(),
            photoURL: user.photoURL,
            rating_num: userBook.rating_num
          };

          reviewerRef(bid, authid).set({
            ...review,
            ...updatedReview
          }).then(() => {
            openSnackbar('Recensione salvata', 'success');
          }).catch(err => {
            openSnackbar(handleFirestoreError(err), 'error');
          });

          userBookRef(authid, bid).update({ 
            review: {
              ...userBookReview,
              ...updatedReview
            }
          }).catch(err => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally(() => {
            if (is.current) {
              setChanges(false);
              setErrors({});
              setIsEditing(false);
              setIsOpenEmojiPicker(false);
              setLoading(false);
              setLeftChars({ text: null, title: null });
            }
          });
        } else console.warn('No bid or user');
      }
    }
  }, [authid, bid, changes, openSnackbar, review, user, userBook, validate]);

  const onDeleteRequest = () => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = useCallback(() => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {        
      reviewerRef(bid, authid).delete().then(() => {
        // console.log('Book review deleted');
        userBookRef(authid, bid).update({ review: {} }).then(() => {
          // console.log('User review deleted');
          openSnackbar(t('common:SUCCESS_DELETED_ITEM'), 'success');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn('No bid');
  }, [authid, bid, openSnackbar, t]);

  const onExitEditing = useCallback(() => {
    if (is.current) {
      if (!review.created_num) {
        setReview(initialReviewState);
      }
      setErrors({});
      setIsEditing(false);
      setIsOpenEmojiPicker(false);
      setLeftChars({ text: null, title: null });
    }
  }, [initialReviewState, review.created_num]);

  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (is.current) {
      if (snackbarIsOpen) closeSnackbar();
      setReview({ ...review, [name]: value });
      setErrors({ ...errors, [name]: null }); 
      setLeftChars({ ...leftChars, [name]: max.chars[name] - value.length });
      setIsOpenEmojiPicker(false);
      setChanges(true);
    } 
  };

  const toggleEmojiPicker = () => {
    if (is.current) setIsOpenEmojiPicker(!isOpenEmojiPicker);
  };

  const onClick = () => {
    if (isOpenEmojiPicker) setIsOpenEmojiPicker(false);
  };

  const onMouseDown = e => e.preventDefault();

  const addEmoji = emoji => {
    setReview({ ...review, text: `${review.text}${emoji.native}` });
    setChanges(true);
  };

  if (!user || !userBook) return null;

  return (
    <Fragment>
      {isEditing && <Overlay onClick={onExitEditing} />}
      <div className={classnames('card', 'light', 'user-review', isEditing ? 'edit-review' : 'primary')}>
        {!loading && (
          isEditing ? (
            <form>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth style={formControlStyle}>
                  <InputLabel error={Boolean(errors.text)} htmlFor='text'>{t('form:LABEL_REVIEW')}</InputLabel>
                  <Input
                    id='text'
                    name='text'
                    type='text'
                    autoFocus={isEditing}
                    placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.text })}
                    value={review.text || ''}
                    onChange={onChangeMaxChars}
                    onClick={onClick}
                    error={Boolean(errors.text)}
                    multiline
                    endAdornment={(
                      <div className='hide-sm'>
                        <InputAdornment position='end'>
                          <Tooltip title={t(isOpenEmojiPicker ? 'ACTION_CLOSE' : 'ACTION_ADD_EMOJI')} placement='top'>
                            <IconButton
                              aria-label='toggle emoji-picker visibility'
                              onClick={toggleEmojiPicker}
                              onMouseDown={onMouseDown}>
                              {isOpenEmojiPicker ? icon.close : icon.stickerEmoji}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      </div>
                    )}
                  />
                  {isOpenEmojiPicker && (
                    <Picker
                      color='rgb(var(--primaryClr))'
                      style={EmojiPickerStyle}
                      onSelect={addEmoji}
                      i18n={emojiMartLocale}
                      showPreview={false}
                      showSkinTones={false}
                      theme='light'
                    />
                  )}
                  {errors.text && <FormHelperText className='message error'>{errors.text}</FormHelperText>}
                  {leftChars.text < 0 && <FormHelperText className='message warning'>{t('CHARACTERS_IN_EXCESS')}: {-leftChars.text}</FormHelperText>}
                </FormControl>
              </div>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.title)} htmlFor='title'>
                    {t('form:LABEL_TITLE')} ({t('OPTIONAL').toLowerCase()})
                  </InputLabel>
                  <Input
                    id='title'
                    name='title'
                    type='text'
                    placeholder={t('ERROR_MAX_COUNT_CHARACTERS', { count: max.chars.title })}
                    value={review.title || ''}
                    onChange={onChangeMaxChars}
                    onClick={onClick}
                    error={Boolean(errors.title)}
                  />
                  {errors.title && (
                    <FormHelperText className='message error'>
                      {errors.title}
                    </FormHelperText>
                  )}
                  {leftChars.title && (
                    <FormHelperText className={classnames('message', leftChars.title < 0 ? 'warning' : 'neutral')}>
                      Caratteri rimanenti: {leftChars.title}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>

              <div className='footer no-gutter'>
                <button type='button' className='btn btn-footer primary' onClick={onSubmit} disabled={!changes}>
                  {t('ACTION_SUBMIT')}
                </button>
              </div>
            </form>
          ) : (
            !review.text ? (
              <button type='button' className='btn flat centered rounded' onClick={onEditing}>
                {t('ACTION_ADD_REVIEW')}
              </button>
            ) : (
              <div className='review'>
                <div className='row'>
                  <div className='col-auto left'>
                    <Avatar className='avatar' src={user.photoURL} alt={user.displayName}>
                      {!user.photoURL && getInitials(user.displayName)}
                    </Avatar>
                  </div>
                  <div className='col right'>
                    <div className='head row'>
                      <div className='col-auto author'>
                        <h3>{user.displayName}</h3>
                      </div>
                      <div className='col text-right rating'>
                        <Rating ratings={{ rating_num: userBook.rating_num }} labels />
                      </div>
                    </div>
                    <h4 className='title'>{review.title}</h4>
                    <p className='text'>{review.text}</p>
                    <div className='foot row'>
                      <div className='col-auto likes'>
                        <Tooltip title={`${review.likes.length} mi piace`}>
                          <div className='counter'>
                            <button type='button' className='btn sm flat thumb up' disabled title={`Piace a ${abbrNum(review.likes.length)}`}>
                              {icon.thumbUp} {abbrNum(review.likes.length)}
                            </button>
                          </div>
                        </Tooltip>
                        <Tooltip title={`${review.comments_num} rispost${review.comments_num === 1 ? 'a' : 'e'}`}>
                          <div className='counter'>
                            <button type='button' className='btn sm flat' disabled>
                              {icon.comment} {review.comments_num}
                            </button>
                          </div>
                        </Tooltip>
                        <div className='counter'>
                          <button type='button' className='btn sm flat' onClick={onEditing}>
                            {icon.pencil} <span className='hide-sm'>{t('ACTION_EDIT')}</span>
                          </button>
                        </div>
                        <div className='counter'>
                          <button type='button' className='btn sm flat' onClick={onDeleteRequest}>
                            {icon.delete} <span className='hide-sm'>{t('ACTION_DELETE')}</span>
                          </button>
                        </div>
                      </div>
                      <div className='col text-right date'>{timeSince(review.created_num)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>

      {
        // isEditing && <div className='form-group'><button onClick={onExitEditing} className='btn flat centered'>Annulla</button></div>
      }

      {isOpenDeleteDialog && (
        <Dialog
          open={isOpenDeleteDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>
            Procedere con l&apos;eliminazione?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              Cancellando la recensione perderai tutti i like e i commenti ricevuti.
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('ACTION_DELETE')}</button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
};

ReviewForm.propTypes = {
  bid: stringType.isRequired,
  userBook: userBookType
};

ReviewForm.defaultProps = {
  userBook: null
};
 
export default ReviewForm;