import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grow from '@material-ui/core/Grow';
import Input from '@material-ui/core/Input';
import { ThemeProvider } from '@material-ui/styles';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { notesRef, reviewerCommenterRef, reviewerRef, userBookRef } from '../../config/firebase';
import { checkBadWords, getInitials, handleFirestoreError, join, normURL, truncateString, urlRegex } from '../../config/shared';
import { darkTheme } from '../../config/themes';
import { stringType, funcType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const max = {
  chars: {
    text: 1000
  }
};

const min = {
  chars: {
    text: 10
  }
};

const CommentForm = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, bookTitle, onCancel, rid } = props;
  const authid = useMemo(() => user && user.uid, [user]);
  const initialCommentState = useMemo(() => ({
    bid,
    bookTitle,
    createdByUid: authid,
    created_num: 0,
    lastEditByUid: authid,
    lastEdit_num: Date.now(),
    displayName: '',
    likes: [],
    photoURL: '',
    text: ''
  }), [authid, bid, bookTitle]);
  const [comment, setComment] = useState(initialCommentState);
  const [leftChars, setLeftChars] = useState({ text: null });
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [changes, setChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const is = useRef(true);

  const fetchComment = useCallback(() => {
    if (bid && rid && user.uid) {
      reviewerCommenterRef(bid, rid, user.uid).onSnapshot(snap => {
        if (is.current) setLoading(true);
  
        if (snap.exists) {
          if (is.current) setComment(snap.data());
        } else if (is.current) {
          setComment(initialCommentState);
        }
        if (is.current) {
          setLoading(false);
          setChanges(false);
        }
      });
    }
  }, [bid, initialCommentState, rid, user.uid]);

  useEffect(() => {
    fetchComment();
  }, [fetchComment]);

  const validate = useCallback(comment => {
    const { text } = comment;
    const errors = {};
    const urlMatches = text.match(urlRegex);
    const badWords = checkBadWords(text);

    if (!text) {
      errors.text = "Aggiungi una risposta";
    } else if (text.length > max.chars.text) {
      errors.text = `Massimo ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Minimo ${min.chars.text} caratteri`;
    } else if (urlMatches) {
      errors.text = `Non inserire link (${join(urlMatches)})`;
    } else if (badWords) {
      errors.text = "Niente volgarità";
    }

    return errors;
  }, []);

  const onSubmit = useCallback(e => {
    e.preventDefault();

    if (changes) {
      const errors = validate(comment);
      if (is.current) setErrors(errors);

      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);

        if (bid && rid && user) {
          reviewerCommenterRef(bid, rid, authid).set({
            ...comment,
            created_num: comment.created_num || Date.now(),
            displayName: user.displayName,
            lastEditByUid: authid,
            lastEdit_num: Date.now(),
            photoURL: user.photoURL
          }).then(() => {
            openSnackbar('Risposta salvata', 'success');

            const likerURL = `/dashboard/${user.uid}`;
            const likerDisplayName = truncateString(user.displayName.split(' ')[0], 12);
            const bookTitle = truncateString(comment.bookTitle, 35);
            const bookURL = `/book/${comment.bid}/${normURL(comment.bookTitle)}`;
            const noteMsg = `<a href="${likerURL}">${likerDisplayName}</a> ha risposto alla tua recensione del libro <a href="${bookURL}">${bookTitle}</a>`;
            const newNoteRef = notesRef(rid).doc();
            
            newNoteRef.set({
              nid: newNoteRef.id,
              text: noteMsg,
              created_num: Date.now(),
              createdBy: user.displayName,
              createdByUid: user.uid,
              photoURL: user.photoURL,
              tag: ['comment'],
              read: false,
              uid: comment.createdByUid
            }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

          if (is.current) {
            setChanges(false);
            setErrors({});
            onCancel();
            setLoading(false);
            setLeftChars({ text: null });
          }
        } else console.warn(`No bid, rid or user`);
      }
    }
  }, [authid, bid, changes, comment, onCancel, openSnackbar, rid, user, validate]);

  const onCloseDeleteDialog = () => setIsOpenDeleteDialog(false);

  const onDelete = useCallback(() => {
    if (is.current) setIsOpenDeleteDialog(false);
    // DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (bid) {        
      reviewerRef(bid, authid).delete().then(() => {
        // console.log(`Comment deleted`);
        userBookRef(authid, bid).update({ comment: {} }).then(() => {
          // console.log(`Comment deleted`);
          openSnackbar('Risposta cancellata', 'success');
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));

    } else console.warn(`No bid`);
  }, [authid, bid, openSnackbar]);

  const onExitEditing = useCallback(() => {
    if (is.current) {
      if (!comment.created_num) {
        setComment(initialCommentState);
      }
      setErrors({});
      onCancel();
      setLeftChars({ text: null });
    }
  }, [initialCommentState, comment.created_num, onCancel]);

  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (is.current) {
      setComment({ ...comment, [name]: value });
      setErrors({ ...errors, [name]: null }); 
      setLeftChars({ ...leftChars, [name]: max.chars[name] - value.length });
      setChanges(true);
    } 
  };

  if (!user) return null;

  return (
    <>
      <div className="comment">
        <div className="row">
          <div className="col-auto left">
            <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
          </div>
          <div className="col right">
            <div className="row">
              <form className="col">
                <div className="form-group">
                  <ThemeProvider theme={darkTheme}>
                    <Input
                      id="text"
                      name="text"
                      type="text"
                      autoFocus={true}
                      placeholder={`Aggiungi una risposta pubblica...`}
                      value={comment.text || ''}
                      onChange={onChangeMaxChars}
                      error={Boolean(errors.text)}
                      margin="dense"
                      fullWidth
                      multiline
                    />
                    {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                    {leftChars.text < 0 && <FormHelperText className="message warning">Caratteri in eccesso: {-leftChars.text}</FormHelperText>}
                  </ThemeProvider>
                </div>

                <div className="pull-right btns">
                  <button type="button" className="btn sm flat" onClick={onExitEditing}>Annulla</button>
                  <button type="button" className="btn sm primary" onClick={onSubmit} disabled={!changes || loading}>Rispondi</button>
                </div>
              </form>
            </div>
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
              Cancellando la risposta perderai tutti i like ricevuti.
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

CommentForm.propTypes = {
  bid: stringType.isRequired,
  bookTitle: stringType.isRequired,
  onCancel: funcType.isRequired,
  rid: stringType.isRequired
}

export default CommentForm;