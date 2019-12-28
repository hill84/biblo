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
import React, { Component, forwardRef } from 'react';
import { authid, reviewerRef, userBookRef } from '../config/firebase';
import icon from '../config/icons';
import { abbrNum, getInitials, handleFirestoreError, join, timeSince, urlRegex } from '../config/shared';
import { funcType, stringType, userBookType, userType } from '../config/types';
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
    text: 120
  }
}

export default class UserReview extends Component {
	state = {
    bid: this.props.bid || '',
    user: this.props.user || {},
    userBook: this.props.userBook || {},
    review: {
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
    },
    leftChars: { text: null, title: null },
    isOpenDeleteDialog: false,
    isOpenEmojiPicker: false,
    changes: false,
    loading: false,
    errors: {},
    isEditing: false
  }

  static propTypes = {
    // addReview: funcType.isRequired,
    bid: stringType.isRequired,
    openSnackbar: funcType.isRequired,
    // removeReview: funcType.isRequired,
    user: userType,
    userBook: userBookType
  }

  static defaultProps = {
    user: null,
    userBook: null
  }

  static getDerivedStateFromProps(props, state) {
    if (props.bid !== state.bid) { return { bid: props.bid }}
    if (props.user !== state.user) { return { user: props.user }}
    if (props.userBook !== state.userBook) { return { userBook: props.userBook }}
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchUserReview();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bid, changes, isEditing, user } = this.state;
    if (this._isMounted) {
      if (bid !== prevState.bid || user !== prevState.user || (changes && !isEditing && isEditing !== prevState.isEditing)) {
        this.fetchUserReview();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubReviewerFetch && this.unsubReviewerFetch();
  }

  fetchUserReview = () => {
    const { bid, review} = this.state;

    // console.log('Fetching user review');
    this.unsubReviewerFetch = reviewerRef(bid, authid).onSnapshot(snap => {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      if (snap.exists) {
        // console.log(snap.data());
        if (this._isMounted) {
          this.setState({ review: snap.data() });
        }
      } else if (this._isMounted) {
        this.setState({ review: {
          ...review,
          created_num: 0,
          likes: [],
          rating_num: 0,
          text: '',
          title: ''
        }});
      }
      if (this._isMounted) this.setState({ loading: false, changes: false });
    });
  }

  onEditing = () => this.setState({ isEditing: true });

  onSubmit = e => {
    const { openSnackbar } = this.props;
    const { bid, changes, review, user, userBook } = this.state;

    e.preventDefault();

    if (changes) {
      const errors = this.validate(review);
      if (this._isMounted) this.setState({ errors });

      if (Object.keys(errors).length === 0) {
        if (this._isMounted) this.setState({ loading: true });

        if (bid) {
          reviewerRef(bid, authid).set({
            ...review,
            bid: userBook.bid,
            bookTitle: userBook.title,
            covers: userBook.covers,
            createdByUid: user.uid,
            created_num: Number((new Date()).getTime()),
            displayName: user.displayName,
            photoURL: user.photoURL,
            rating_num: userBook.rating_num
          }).then(() => {
            // console.log(`Book review created`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          userBookRef(authid, bid).update({
            review: {
              ...review,
              created_num: (new Date()).getTime()
            }
          }).then(() => {
            // console.log(`User review posted`);
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          if (this._isMounted) {
            this.setState({ 
              changes: false,
              errors: {},
              isEditing: false,
              isOpenEmojiPicker: false,
              loading: false,
              leftChars: { text: null, title: null },
            });
          }
        } else console.warn(`No bid`);
      }
    } else if (this._isMounted) {
      this.setState({
        errors: {},
        isEditing: false,
        isOpenEmojiPicker: false,
        leftChars: { text: null, title: null },
      });
    }
  }

  onDeleteRequest = () => this.setState({ isOpenDeleteDialog: true });

  onCloseDeleteDialog = () => this.setState({ isOpenDeleteDialog: false });

  onDelete = () => {
    const { bid } = this.state;
    const { openSnackbar } = this.props;

    if (this._isMounted) this.setState({ isOpenDeleteDialog: false });
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
  }

  onExitEditing = () => {
    const { review } = this.state;

    if (this._isMounted) {
      if (!review.created_num) {
        this.setState({
          review: {
            ...review,
            bid: '',
            bookTitle: '',
            covers: [],
            created_num: 0,
            likes: [],
            rating_num: 0,
            text: '',
            title: ''
          } 
        });
      }
      this.setState({
        errors: {},
        isEditing: false,
        isOpenEmojiPicker: false,
        leftChars: { text: null, title: null },
      });
    }
  }

  onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (this._isMounted) {
      this.setState(prevState => ({
        review: { ...prevState.review, [name]: value },
        errors: { ...prevState.errors, [name]: null } , 
        leftChars: { ...prevState.leftChars, [name]: max.chars[name] - value.length },
        isOpenEmojiPicker: false,
        changes: true
      }));
    } 
  };

  validate = review => {
    const { text, title } = review;
    const errors = {};
    const urlMatches = text.match(urlRegex);

    if (!text) {
      errors.text = "Aggiungi una recensione";
    } else if (text.length > max.chars.text) {
      errors.text = `Lunghezza massima ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Lunghezza minima ${min.chars.text} caratteri`;
    } else if (urlMatches) {
      errors.text = `Non inserire link (${join(urlMatches)})`;
    }
    if (title && title.length > max.chars.title) {
      errors.title = `Lunghezza massima ${max.chars.title} caratteri`;
    }
    return errors;
  }

  toggleEmojiPicker = () => {
    this.setState(prevState => ({
      isOpenEmojiPicker: !prevState.isOpenEmojiPicker
    }));
  };

  onClick = () => {
    if (this.state.isOpenEmojiPicker) {
      this.setState({ isOpenEmojiPicker: false });
    }
  }

  onMouseDown = e => e.preventDefault();

  addEmoji = emoji => {
    // console.log(emoji);
    this.setState(prevState => ({
      review: { ...prevState.review, text: `${prevState.review.text}${emoji.native}` },
      changes: true
    }));
  };
  
  render() {
    const { changes, errors, isEditing, isOpenDeleteDialog, isOpenEmojiPicker, loading, review, leftChars, user, userBook } = this.state;

    if (!user || !userBook) return null;

    return (
      <>
        {isEditing && <Overlay onClick={this.onExitEditing} />}
        <div className={`card light user-review ${isEditing ? 'edit-review' : 'primary'}`}>
          {!loading &&        
            !isEditing ? (
              !review.text ? 
                <button type="button" className="btn flat centered rounded" onClick={this.onEditing}>Aggiungi una recensione</button>
              :
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
                            <button type="button" className="btn sm flat thumb up" disabled title={`Piace a ${abbrNum(review.likes.length)}`}>{icon.thumbUp()} {abbrNum(review.likes.length)}</button>
                          </div>
                          <div className="counter">
                            <button type="button" className="btn sm flat" disabled>{icon.comment()} 0</button>
                          </div>
                          <div className="counter">
                            <button type="button" className="btn sm flat" onClick={this.onEditing}>{icon.pencil()} <span className="hide-sm">Modifica</span></button>
                          </div>
                          <div className="counter">
                            <button type="button" className="btn sm flat" onClick={this.onDeleteRequest}>{icon.delete()} <span className="hide-sm">Elimina</span></button>
                          </div>
                        </div>
                        <div className="col text-right date">{timeSince(review.created_num)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            : (
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
                      onChange={this.onChangeMaxChars}
                      onClick={this.onClick}
                      error={Boolean(errors.text)}
                      multiline
                      endAdornment={
                        <InputAdornment position="end">
                          <Tooltip title={isOpenEmojiPicker ? 'Chiudi' : 'Aggiungi emoji'} placement="top">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={this.toggleEmojiPicker}
                              onMouseDown={this.onMouseDown}
                            >
                              {isOpenEmojiPicker ? icon.close() : icon.stickerEmoji()}
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      }
                    />
                    {isOpenEmojiPicker && (
                      <Picker
                        color="rgb(var(--primaryClr))"
                        style={EmojiPickerStyle}
                        onSelect={this.addEmoji}
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
                      onChange={this.onChangeMaxChars}
                      onClick={this.onClick}
                      error={Boolean(errors.title)}
                    />
                    {errors.title && <FormHelperText className="message error">{errors.title}</FormHelperText>}
                    {leftChars.title && <FormHelperText className={`message ${(leftChars.title) < 0 ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {leftChars.title}</FormHelperText>}
                  </FormControl>
                </div>

                <div className="footer no-gutter">
                  <button type="button" className="btn btn-footer primary" onClick={this.onSubmit} disabled={!changes}>Pubblica</button>
                </div>
              </form>
            )
          }
        </div>

        {/* isEditing &&
          <div className="form-group">
            <button onClick={this.onExitEditing} className="btn flat centered">Annulla</button>
          </div>
        */}

        <Dialog
          open={isOpenDeleteDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.onCloseDeleteDialog}
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
            <button type="button" className="btn btn-footer flat" onClick={this.onCloseDeleteDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onDelete}>Elimina</button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}