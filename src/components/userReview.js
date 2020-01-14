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
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { reviewerRef, userBookRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, join, timeSince, urlRegex } from '../config/shared';
import { stringType, userBookType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/emojiMart.css';
import emojiMartLocale from '../locales/emojiMart';
import Overlay from './overlay';
import Rating from './rating';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

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
    text: 100
  }
};

const UserReview = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, userBook } = props;
  const [review, setReview] = useState({
    bid: '',
    bookTitle: '',
    covers: [],
    createdByUid: '',
    created_num: 0,
    displayName: '',
    likes: [],
    photoURL: '',
    rating_num: 0,
    text: '',
    title: ''
  });
  const [leftChars, setLeftChars] = useState({ text: null, title: null });
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isOpenEmojiPicker, setIsOpenEmojiPicker] = useState(false);
  const [changes, setChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const is = useRef(true);

  const authid = useMemo(() => user && user.uid, [user]);

  const fetchUserReview = useCallback(() => {
    reviewerRef(bid, authid).onSnapshot(snap => {
      if (is.current) setLoading(true);

      if (snap.exists) {
        if (is.current) setReview(snap.data());
      } else if (is.current) {
        setReview(review => ({
          ...review,
          created_num: 0,
          likes: [],
          rating_num: 0,
          text: '',
          title: ''
        }));
      }
      if (is.current) {
        setLoading(false);
        setChanges(false);
      }
    });
  }, [authid, bid]);

  useEffect(() => {
    fetchUserReview();
  }, [fetchUserReview]);

  const onEditing = () => {
    if (is.current) setIsEditing(true);
  };

  const validate = useCallback(review => {
    const { text, title } = review;
    const errors = {};
    const urlMatches = text.match(urlRegex);

    if (!text) {
      errors.text = "Aggiungi una recensione";
    } else if (text.length > max.chars.text) {
      errors.text = `Massimo ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Minimo ${min.chars.text} caratteri`;
    } else if (urlMatches) {
      errors.text = `Non inserire link (${join(urlMatches)})`;
    }
    if (title && title.length > max.chars.title) {
      errors.title = `Massimo ${max.chars.title} caratteri`;
    }
    return errors;
  }, []);

  const onSubmit = useCallback(e => {
    e.preventDefault();

    if (changes) {
      const errors = validate(review);
      if (is.current) setErrors(errors);

      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);

        if (bid) {
          reviewerRef(bid, authid).set({
            ...review,
            bid: userBook.bid,
            bookTitle: userBook.title,
            covers: userBook.covers,
            createdByUid: authid,
            created_num: Date.now(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            rating_num: userBook.rating_num
          }).then(() => {
            // console.log(`Book review created`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          userBookRef(authid, bid).update({
            review: {
              ...review,
              created_num: Date.now()
            }
          }).then(() => {
            // console.log(`User review posted`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          if (is.current) {
            setChanges(false);
            setErrors({});
            setIsEditing(false);
            setIsOpenEmojiPicker(false);
            setLoading(false);
            setLeftChars({ text: null, title: null });
          }
        } else console.warn(`No bid`);
      }
    } else if (is.current) {
      setErrors({});
      setIsEditing(false);
      setIsOpenEmojiPicker(false);
      setLeftChars({ text: null, title: null });
    }
  }, [authid, bid, changes, openSnackbar, review, user, userBook, validate]);

  const onDeleteRequest = () => setIsOpenDeleteDialog(true);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = useCallback(() => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {        
      reviewerRef(bid, authid).delete().then(() => {
        // console.log(`Book review deleted`);
        userBookRef(authid, bid).update({ review: {} }).then(() => {
          // console.log(`User review deleted`);
          openSnackbar('Recensione cancellata', 'success');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn(`No bid`);
  }, [authid, bid, openSnackbar]);

  const onExitEditing = useCallback(() => {
    if (is.current) {
      if (!review.created_num) {
        setReview(review => ({
          ...review,
          bid: '',
          bookTitle: '',
          covers: [],
          created_num: 0,
          likes: [],
          rating_num: 0,
          text: '',
          title: ''
        }));
      }
      setErrors({});
      setIsEditing(false);
      setIsOpenEmojiPicker(false);
      setLeftChars({ text: null, title: null });
    }
  }, [review.created_num]);

  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (is.current) {
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
    <>
      {isEditing && <Overlay onClick={onExitEditing} />}
      <div className={`card light user-review ${isEditing ? 'edit-review' : 'primary'}`}>
        {!loading && (
          isEditing ? (
            <form>
              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.text)} htmlFor="text">Recensione</InputLabel>
                  <Input
                    id="text"
                    name="text"
                    type="text"
                    autoFocus={isEditing}
                    placeholder={`Scrivi una recensione (max ${max.chars.text} caratteri)...`}
                    value={review.text || ''}
                    onChange={onChangeMaxChars}
                    onClick={onClick}
                    error={Boolean(errors.text)}
                    multiline
                    endAdornment={
                      <InputAdornment position="end">
                        <Tooltip title={isOpenEmojiPicker ? 'Chiudi' : 'Aggiungi emoji'} placement="top">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleEmojiPicker}
                            onMouseDown={onMouseDown}
                          >
                            {isOpenEmojiPicker ? icon.close : icon.stickerEmoji}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    }
                  />
                  {isOpenEmojiPicker && (
                    <Picker
                      color="rgb(var(--primaryClr))"
                      style={EmojiPickerStyle}
                      onSelect={addEmoji}
                      i18n={emojiMartLocale}
                    />
                  )}
                  {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                  {leftChars.text && <FormHelperText className={`message ${(leftChars.text < 0) ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {leftChars.text}</FormHelperText>}
                </FormControl>
              </div>
              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.title)} htmlFor="title">Titolo (opzionale)</InputLabel>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder={`Aggiungi un titolo (max ${max.chars.title} caratteri)...`}
                    value={review.title || ''}
                    onChange={onChangeMaxChars}
                    onClick={onClick}
                    error={Boolean(errors.title)}
                  />
                  {errors.title && <FormHelperText className="message error">{errors.title}</FormHelperText>}
                  {leftChars.title && <FormHelperText className={`message ${(leftChars.title) < 0 ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {leftChars.title}</FormHelperText>}
                </FormControl>
              </div>

              <div className="footer no-gutter">
                <button type="button" className="btn btn-footer primary" onClick={onSubmit} disabled={!changes}>Pubblica</button>
              </div>
            </form>
          ) : (
            !review.text ? (
              <button type="button" className="btn flat centered rounded" onClick={onEditing}>Aggiungi una recensione</button>
            ) : (
              <div className="review">
                <div className="row">
                  <div className="col-auto left">
                    <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                  </div>
                  <div className="col right">
                    <div className="head row">
                      <div className="col-auto author">
                        <h3>{user.displayName}</h3>
                      </div>
                      <div className="col text-right rating">
                        <Rating ratings={{rating_num: userBook.rating_num}} labels />
                      </div>
                    </div>
                    <h4 className="title">{review.title}</h4>
                    <p className="text">{review.text}</p>
                    <div className="foot row">
                      <div className="col-auto likes">
                        <div className="counter">
                          <button type="button" className="btn sm flat thumb up" disabled title={`Piace a ${abbrNum(review.likes.length)}`}>{icon.thumbUp} {abbrNum(review.likes.length)}</button>
                        </div>
                        <div className="counter">
                          <button type="button" className="btn sm flat" disabled>{icon.comment} 0</button>
                        </div>
                        <div className="counter">
                          <button type="button" className="btn sm flat" onClick={onEditing}>{icon.pencil} <span className="hide-sm">Modifica</span></button>
                        </div>
                        <div className="counter">
                          <button type="button" className="btn sm flat" onClick={onDeleteRequest}>{icon.delete} <span className="hide-sm">Elimina</span></button>
                        </div>
                      </div>
                      <div className="col text-right date">{timeSince(review.created_num)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>

      {
        // isEditing && <div className="form-group"><button onClick={onExitEditing} className="btn flat centered">Annulla</button></div>
      }

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
    </>
  );
}

UserReview.propTypes = {
  // addReview: funcType.isRequired,
  bid: stringType.isRequired,
  // removeReview: funcType.isRequired,
  userBook: userBookType
}

UserReview.defaultProps = {
  userBook: null
}
 
export default UserReview;