import data from '@emoji-mart/data';
import emojiMartLocaleIt from '@emoji-mart/data/i18n/it.json';
import Picker from '@emoji-mart/react';
import type { FirestoreError } from '@firebase/firestore-types';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grow, Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import type { TransitionProps } from '@material-ui/core/transitions';
import classnames from 'classnames';
import type { ChangeEvent, FC, MouseEvent, ReactElement, Ref } from 'react';
import { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { reviewerRef, userBookRef } from '../../config/firebase';
import icon from '../../config/icons';
import { abbrNum, checkBadWords, extractUrls, getInitials, handleFirestoreError, join, timeSince } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/emojiMart.css';
import '../../css/reviewForm.css';
import { fallbackLanguage, getLocale } from '../../i18n';
import type { ReviewModel, UserBookModel } from '../../types';
import Overlay from '../overlay';
import Rating from '../rating';

const Transition = forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

interface ErrorsModel {
  text?: string;
  title?: string;
}

interface LeftCharsState {
  text: string | null;
  title: string | null;
}

const max = {
  chars: {
    text: 3000,
    title: 255,
  },
} as const;

const min = {
  chars: {
    text: 25,
  },
} as const;

const formControlStyle = { zIndex: 1, };

const buildInitialReview = (authid: string, bid: string): ReviewModel => ({
  bid,
  bookTitle: '',
  comments_num: 0,
  covers: [],
  coverURL: [],
  created_num: 0,
  createdByUid: authid,
  displayName: '',
  lastEdit_num: Date.now(),
  lastEditByUid: authid,
  likes: [],
  photoURL: '',
  rating_num: 0,
  text: '',
  title: ''
});

interface ReviewFormProps {
  userBook: UserBookModel;
  bid: string;
}

const ReviewForm: FC<ReviewFormProps> = ({
  bid,
  userBook,
}: ReviewFormProps) => {
  const { user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar, snackbarIsOpen } = useContext(SnackbarContext);

  const locale: Locale | undefined = getLocale();

  const authid: string = user?.uid || '';

  const initialReview = useMemo((): ReviewModel => buildInitialReview(authid, bid), [authid, bid]);

  const [review, setReview] = useState<ReviewModel>(initialReview);
  const [leftChars, setLeftChars] = useState<LeftCharsState>({ text: null, title: null });
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [isOpenEmojiPicker, setIsOpenEmojiPicker] = useState<boolean>(false);
  const [changes, setChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsModel>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { t } = useTranslation(['form', 'common']);

  const is = useRef<boolean>(true);

  const fetchReview = useCallback((): void => {
    reviewerRef(bid, authid).onSnapshot((snap: firebase.firestore.DocumentSnapshot): void => {
      if (is.current) {
        setLoading(true);

        const initialReview: ReviewModel = buildInitialReview(authid, bid);

        if (snap.exists) {
          setReview({ ...initialReview, ...snap.data() });
        } else {
          setReview(initialReview);
        }
        setLoading(false);
        setChanges(false);
      }
    }, (err: FirestoreError): void => console.warn(err));
  }, [authid, bid]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  useEffect(() => {
    if (isEditing && !user?.photoURL) {
      const msg = <span>Non hai <span className='hide-sm'>ancora caricato</span> una foto profilo.</span>;
      const action = <Link to='/profile' type='button' className='btn sm flat' onClick={closeSnackbar}>Aggiungila</Link>;
      openSnackbar(msg, 'info', 4000, action);
    }
  }, [closeSnackbar, isEditing, openSnackbar, user?.photoURL]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onEditing = (): void => setIsEditing(true);

  const validate = (review: ReviewModel): ErrorsModel => {
    const { text, title } = review;
    const errors: ErrorsModel = {};
    const urlMatches: RegExpMatchArray | null = extractUrls(text);
    const badWords: boolean = checkBadWords(text);

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
  };

  const onSubmit = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();

    if (!changes) return;
    const errors: ErrorsModel = validate(review);
    if (is.current) setErrors(errors);

    if (!Object.values(errors).some(Boolean)) {
      if (is.current) setLoading(true);

      if (bid && user) {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { comments_num, flag, likes, ...userBookReview } = review;
        const updatedReview: Partial<ReviewModel> = {
          bookTitle: userBook.title,
          covers: userBook.covers,
          created_num: review.created_num || Date.now(),
          displayName: user.displayName,
          lastEditByUid: authid,
          lastEdit_num: Date.now(),
          photoURL: user.photoURL,
          rating_num: userBook.rating_num,
        };

        reviewerRef(bid, authid).set({
          ...review,
          ...updatedReview
        }).then((): void => {
          openSnackbar('Recensione salvata', 'success');
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        });

        userBookRef(authid, bid).update({
          review: {
            ...userBookReview,
            ...updatedReview
          }
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        }).finally((): void => {
          if (!is.current) return;
          setChanges(false);
          setErrors({});
          setIsEditing(false);
          setIsOpenEmojiPicker(false);
          setLoading(false);
          setLeftChars({ text: null, title: null });
        });
      } else console.warn('No bid or user');
    }
  };

  const onDeleteRequest = (): void => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = (): void => setIsOpenDeleteDialog(false);

  const onDelete = (): void => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {
      reviewerRef(bid, authid).delete().then((): void => {
        // console.log('Book review deleted');
        userBookRef(authid, bid).update({ review: {} }).then((): void => {
          // console.log('User review deleted');
          openSnackbar(t('common:SUCCESS_DELETED_ITEM'), 'success');
        }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn('No bid');
  };

  const onExitEditing = (): void => {
    if (!is.current) return;
    if (!review.created_num) setReview(initialReview);
    setErrors({});
    setIsEditing(false);
    setIsOpenEmojiPicker(false);
    setLeftChars({ text: null, title: null });
  };

  const onChangeMaxChars = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;

    if (!is.current) return;
    if (snackbarIsOpen) closeSnackbar(e);
    setReview({ ...review, [name]: value });
    setErrors({ ...errors, [name]: null });
    setLeftChars({ ...leftChars, [name]: max.chars[name as never] - value.length });
    setIsOpenEmojiPicker(false);
    setChanges(true);
  };

  const toggleEmojiPicker = (): void => {
    if (is.current) setIsOpenEmojiPicker(!isOpenEmojiPicker);
  };

  const onClick = (): void => {
    if (isOpenEmojiPicker) setIsOpenEmojiPicker(false);
  };

  const onMouseDown = (e: MouseEvent<HTMLButtonElement>): void => e.preventDefault();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addEmoji = (emoji: any): void => {
    setReview({ ...review, text: `${review.text}${emoji.native}` });
    setChanges(true);
  };

  if (!user || !userBook) return null;

  return (
    <>
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
                          <Tooltip title={t(`common:${isOpenEmojiPicker ? 'ACTION_CLOSE' : 'ACTION_ADD_EMOJI'}`)} placement='top'>
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
                      className='emoji-picker'
                      data={data}
                      emojiButtonColors={['rgb(var(--primaryClr))']}
                      i18n={emojiMartLocaleIt}
                      locale={locale?.code || fallbackLanguage.id}
                      maxFrequentRows={0}
                      onEmojiSelect={addEmoji}
                      previewPosition='none'
                      theme='light'
                    />
                  )}
                  {errors.text && (
                    <FormHelperText className='message error'>{errors.text}</FormHelperText>
                  )}
                  {Number(leftChars.text) < 0 && (
                    <FormHelperText className='message warning'>
                      {t('CHARACTERS_IN_EXCESS')}: {-Number(leftChars.text)}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.title)} htmlFor='title'>
                    {t('LABEL_TITLE')} ({t('OPTIONAL').toLowerCase()})
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
                    <FormHelperText className={classnames('message', Number(leftChars.title) < 0 ? 'warning' : 'neutral')}>
                      {t('REMAINING_CHARACTERS')}: {leftChars.title}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>

              <div className='footer no-gutter'>
                <button type='button' className='btn btn-footer primary' onClick={onSubmit} disabled={!changes}>
                  {t('common:ACTION_SUBMIT')}
                </button>
              </div>
            </form>
          ) : (
            !review.text ? (
              <button type='button' className='btn flat centered rounded' onClick={onEditing}>
                {t('common:ACTION_ADD_REVIEW')}
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
                            <button type='button' className='btn sm flat thumb up' disabled title={t('common:COUNT_READERS_LIKE_IT', { count: review.likes.length })}>
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
                            {icon.pencil} <span className='hide-sm'>{t('common:ACTION_EDIT')}</span>
                          </button>
                        </div>
                        <div className='counter'>
                          <button type='button' className='btn sm flat' onClick={onDeleteRequest}>
                            {icon.delete} <span className='hide-sm'>{t('common:ACTION_DELETE')}</span>
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
            {t('common:DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              {t('common:DIALOG_REMOVE_REVIEW_PARAGRAPH')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('common:ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('common:ACTION_DELETE')}</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ReviewForm;