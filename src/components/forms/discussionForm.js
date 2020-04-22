import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grow from '@material-ui/core/Grow';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { ThemeProvider } from '@material-ui/styles';
import React, { forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionsRef, notesRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, checkBadWords, extractMuids, extractUrls, getInitials, handleFirestoreError, join, normURL, truncateString } from '../../config/shared';
import { defaultTheme, primaryTheme } from '../../config/themes';
import { stringType } from '../../config/types';
import GroupContext from '../../context/groupContext';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/discussionForm.css';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const max = {
  chars: {
    text: 2000
  },
  mentions: 10
};

const min = {
  chars: {
    text: 10
  }
};

const formControlStyle = { marginTop: '8px', };

const DiscussionForm = props => {
  const { isEditor, user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar, snackbarIsOpen } = useContext(SnackbarContext);
  const { followers, item: group } = useContext(GroupContext);
  const { gid } = props;
  const authid = useMemo(() => user?.uid, [user]);
  const initialDiscussionState = useMemo(() => ({
    gid,
    createdByUid: authid,
    created_num: 0,
    lastEditByUid: authid,
    lastEdit_num: Date.now(),
    displayName: '',
    photoURL: '',
    text: '',
  }), [authid, gid]);
  const [discussion, setDiscussion] = useState(initialDiscussionState);
  const [leftChars, setLeftChars] = useState({ text: null, title: null });
  const [changes, setChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isOpenBriefDialog, setIsOpenBriefDialog] = useState(false);
  const [isOpenFollowersDialog, setIsOpenFollowersDialog] = useState(false);
  const is = useRef(true);
  const textInput = useRef(null);

  const groupFollowers = useMemo(() => followers?.filter(user => user.uid !== authid), [authid, followers]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  useEffect(() => {
    if (!user?.photoURL) {
      const msg = <span>Non hai <span className="hide-sm">ancora caricato</span> una foto profilo.</span>;
      const action = <Link to="/profile" type="button" className="btn sm flat" onClick={closeSnackbar}>Aggiungila</Link>;
      openSnackbar(msg, 'info', 4000, action);
    }
  }, [closeSnackbar, openSnackbar, user]);

  const validate = useCallback(discussion => {
    const { text } = discussion;
    const errors = {};
    const urls = extractUrls(text);
    const badWords = checkBadWords(text);
    const muids = extractMuids(text);

    if (!text) {
      errors.text = "Aggiungi un commento";
    } else if (text.length > max.chars.text) {
      errors.text = `Massimo ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Minimo ${min.chars.text} caratteri`;
    } else if (urls) {
      errors.text = `Non inserire link esterni (${join(urls)})`;
    } else if (muids?.length > max.mentions) {
      errors.text = `Massimo ${max.mentions} menzioni`;
    } else if (badWords) {
      errors.text = "Niente volgarità";
    }

    return errors;
  }, []);

  const onSubmit = e => {
    e.preventDefault();

    if (changes) {
      const errors = validate(discussion);
      if (is.current) setErrors(errors);

      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);

        if (gid && user) {
          const ref = groupDiscussionsRef(gid).doc();
          const updatedDiscussion = {
            did: ref.id,
            created_num: discussion.created_num || Date.now(),
            displayName: user.displayName,
            lastEditByUid: authid,
            lastEdit_num: Date.now(),
            photoURL: user.photoURL
          };

          ref.set({
            ...discussion,
            ...updatedDiscussion
          }).then(() => {
            extractMuids(discussion.text)?.forEach(muid => {
              if (followers?.some(follower => follower.uid === muid)) {   
                const discussantURL = `/dashboard/${authid}`;
                const discussantDisplayName = truncateString(user.displayName.split(' ')[0], 12);
                const groupURL = `/group/${gid}`;
                const groupTitle = group.title;
                const noteMsg = `<a href="${discussantURL}">${discussantDisplayName}</a> ti ha menzionato nel gruppo <a href="${groupURL}">${groupTitle}</a>`;
                const newNoteRef = notesRef(muid).doc();
                
                newNoteRef.set({
                  nid: newNoteRef.id,
                  text: noteMsg,
                  created_num: Date.now(),
                  createdBy: user.displayName,
                  createdByUid: user.uid,
                  photoURL: user.photoURL,
                  tag: ['mention'],
                  read: false,
                  uid: muid
                }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
              }
            });

          }).catch(err => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally(() => {
            if (is.current) {
              setLoading(false);
              setChanges(false);
              setErrors({});
              setDiscussion(initialDiscussionState);
              setLeftChars({ text: null, title: null });
            }
          });
        } else console.warn(`No gid or user`);
      }
    }
  };

  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (is.current) {
      if (snackbarIsOpen) closeSnackbar();
      setDiscussion({ ...discussion, [name]: value });
      setErrors({ ...errors, [name]: null }); 
      setLeftChars({ ...leftChars, [name]: max.chars[name] - value.length });
      setChanges(true);
    }
  };

  const onOpenBriefDialog = () => setIsOpenBriefDialog(true);

  const onCloseBriefDialog = () => setIsOpenBriefDialog(false);

  const onOpenFollowersDialog = () => setIsOpenFollowersDialog(true);

  const onCloseFollowersDialog = () => setIsOpenFollowersDialog(false);

  const onMentionFollower = e => {
    const { displayName, fuid } = e.currentTarget.dataset;
    const mention = `${discussion.text ? ' ' : ''}@dashboard/${fuid}/${normURL(displayName)} `;

    if (is.current) {
      if (snackbarIsOpen) closeSnackbar();
      setDiscussion({ ...discussion, text: discussion.text + mention });
      setErrors({ ...errors, text: null }); 
      setLeftChars({ ...leftChars, text: max.chars.text - mention.length });
      setChanges(true);
      setIsOpenFollowersDialog(false);
      setTimeout(() => {
        const ref = textInput.current;
        ref.selectionStart = 10000;
        ref.selectionEnd = ref.selectionStart;
        ref.focus();
      }, 0);
    } 
  };

  return (
    <form className={`card user-discussion ${discussion?.text ? 'light' : 'primary'}`}>
      {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      <div className="form-group">
        <FormControl className="input-field" margin="dense" fullWidth style={formControlStyle}>
          <ThemeProvider theme={discussion?.text ? defaultTheme : primaryTheme}>
            <InputLabel error={Boolean(errors.text)} htmlFor="text">Il tuo commento</InputLabel>
            <Input
              inputRef={textInput}
              id="text"
              name="text"
              type="text"
              placeholder="Scrivi il tuo commento"
              value={discussion.text || ''}
              onChange={onChangeMaxChars}
              error={Boolean(errors.text)}
              multiline
              endAdornment={(
                <div className="flex" style={{ marginTop: '-8px', }}>
                  {groupFollowers?.length > 0 && (
                    <Tooltip title="Menziona utente">
                      <button
                        type="button"
                        className="btn sm counter flat icon"
                        onClick={onOpenFollowersDialog}>
                        {icon.account}
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip title="Aiuto per la formattazione">
                    <button
                      type="button"
                      className="btn sm counter flat icon"
                      onClick={onOpenBriefDialog}>
                      {icon.lifebuoy}
                    </button>
                  </Tooltip>
                  {discussion?.text && (
                    <button
                      type="button"
                      className="btn sm counter primary"
                      onClick={onSubmit}>
                      Pubblica
                    </button>
                  )}
                </div>
              )}
            />
          </ThemeProvider>
          {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
          {leftChars.text < 0 && <FormHelperText className="message warning">Caratteri in eccesso: {-leftChars.text}</FormHelperText>}
        </FormControl>
      </div>

      {isOpenBriefDialog && (
        <Dialog
          className="dropdown-menu"
          open={isOpenBriefDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseBriefDialog}
          aria-labelledby="brief-dialog-title"
          aria-describedby="brief-dialog-description">
          <div className="absolute-top-right">
            <button type="button" className="btn flat rounded icon" aria-label="close" onClick={onCloseBriefDialog}>
              {icon.close}
            </button>
          </div>
          <DialogTitle id="brief-dialog-title">
            Aiuto per la formattazione
          </DialogTitle>
          <DialogContent id="brief-dialog-description">
            <p>Nel commento puoi <b>menzionare</b> altri utenti o includere <b>link</b> a contenuti presenti su {app.name}. Puoi usare il pulsante {icon.account} o scrivere @ seguito da tipologia, identificativo e nome. Ecco una piccola guida:</p>
            <ul>
              <li>Utente: <code>@dashboard/ID_UTENTE/Nome_Utente</code></li>
              <li>Libro: <code>@book/ID_LIBRO/Titolo_Libro</code></li>
              <li>Autore: <code>@author/ID_AUTORE/Nome_Autore</code></li>
              <li>Collezione: <code>@collection/ID_COLLEZIONE/Titolo_Collezione</code></li>
            </ul>
          </DialogContent>
        </Dialog>
      )}

      {isOpenFollowersDialog && (
        <Dialog
          className="dropdown-menu"
          open={isOpenFollowersDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseFollowersDialog}
          aria-labelledby="followers-dialog-title">
          <div className="absolute-top-right">
            <button type="button" className="btn flat rounded icon" aria-label="close" onClick={onCloseFollowersDialog}>
              {icon.close}
            </button>
          </div>
          <DialogTitle id="followers-dialog-title">
            Iscritti del gruppo
          </DialogTitle>
          <DialogContent className="content" id="followers-dialog-description">
            <div className="contacts-tab">
              {groupFollowers?.map(user => (
                <div key={user.uid} className="avatar-row">
                  <div className="row">
                    <div className="col-auto">
                      <Link to={`/dashboard/${user.uid}`}>
                        <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>
                          {!user.photoURL && getInitials(user.displayName)}
                        </Avatar>
                      </Link>
                    </div>
                    <div className="col">
                      <div className="row">
                        <Link to={`/dashboard/${user.uid}`} className="col name">{user.displayName}</Link>
                        {isEditor && (
                          <div className="col-auto">
                            <button
                              type="button"
                              className="btn sm rounded flat"
                              data-display-name={user.displayName}
                              data-fuid={user.uid}
                              onClick={onMentionFollower}>
                              Menziona
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}

DiscussionForm.propTypes = {
  gid: stringType.isRequired
}
 
export default DiscussionForm;