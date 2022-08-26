import { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
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
import { TransitionProps } from '@material-ui/core/transitions';
import { ThemeProvider } from '@material-ui/styles';
import classnames from 'classnames';
import React, { ChangeEvent, CSSProperties, FC, FormEvent, forwardRef, MouseEvent, ReactElement, Ref, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionsRef, notesRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, checkBadWords, extractMuids, extractUrls, getInitials, handleFirestoreError, join, normURL, truncateString } from '../../config/shared';
import { defaultTheme, primaryTheme } from '../../config/themes';
import GroupContext from '../../context/groupContext';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/discussionForm.css';
import { CurrentTarget } from '../../types';

const Transition = forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

interface MaxModel {
  chars: Record<'text', number>;
  mentions: number;
}

interface MinModel {
  chars: Record<'text', number>;
}

const max: MaxModel = {
  chars: {
    text: 2000
  },
  mentions: 10
};

const min: MinModel = {
  chars: {
    text: 10
  }
};

interface DiscussionFormProps {
  gid?: string;
}

interface DiscussionModel {
  did: string;
  gid: string;
  createdByUid: string;
  created_num: number;
  lastEditByUid: string;
  lastEdit_num: number;
  displayName: string;
  photoURL: string;
  text: string;
}

type ErrorsModel = Partial<Record<'text', string>>;

const formControlStyle: CSSProperties = { marginTop: '8px', };

const DiscussionForm: FC<DiscussionFormProps> = ({ gid = '' }: DiscussionFormProps) => {
  const { isEditor, user } = useContext(UserContext);
  const { closeSnackbar, openSnackbar, snackbarIsOpen } = useContext(SnackbarContext);
  const { followers, item: group } = useContext(GroupContext);
  const authid = useMemo((): string | undefined => user?.uid, [user]);
  const initialDiscussionState = useMemo((): Partial<DiscussionModel> => ({
    gid,
    createdByUid: authid,
    created_num: 0,
    lastEditByUid: authid,
    lastEdit_num: Date.now(),
    displayName: '',
    photoURL: '',
    text: '',
  }), [authid, gid]);
  const [discussion, setDiscussion] = useState<DiscussionModel>(initialDiscussionState as DiscussionModel);
  const [leftChars, setLeftChars] = useState<Record<'text' | 'title', number | null>>({ text: null, title: null });
  const [changes, setChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsModel>({});
  const [isOpenBriefDialog, setIsOpenBriefDialog] = useState<boolean>(false);
  const [isOpenFollowersDialog, setIsOpenFollowersDialog] = useState<boolean>(false);
  const textInput = useRef<HTMLInputElement>(null);

  const groupFollowers = useMemo(() => followers?.filter(user => user.uid !== authid), [authid, followers]);

  useEffect(() => {
    if (!user?.photoURL) {
      const msg = <span>Non hai <span className='hide-sm'>ancora caricato</span> una foto profilo.</span>;
      const action = <Link to='/profile' type='button' className='btn sm flat' onClick={closeSnackbar}>Aggiungila</Link>;
      openSnackbar(msg, 'info', 4000, action);
    }
  }, [closeSnackbar, openSnackbar, user]);

  const validate = useCallback((discussion: DiscussionModel): ErrorsModel => {
    const { text } = discussion;
    const errors: ErrorsModel = {};
    const urls: RegExpMatchArray | null = extractUrls(text);
    const badWords: boolean = checkBadWords(text);
    const muids: string[] = extractMuids(text);

    if (!text) {
      errors.text = 'Aggiungi un commento';
    } else if (text.length > max.chars.text) {
      errors.text = `Massimo ${max.chars.text} caratteri`;
    } else if (text.length < min.chars.text) {
      errors.text = `Minimo ${min.chars.text} caratteri`;
    } else if (urls) {
      errors.text = `Non inserire link esterni (${join(urls)})`;
    } else if (muids?.length > max.mentions) {
      errors.text = `Massimo ${max.mentions} menzioni`;
    } else if (badWords) {
      errors.text = 'Niente volgarità';
    }

    return errors;
  }, []);

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();

    if (changes) {
      const errors: ErrorsModel = validate(discussion);
      setErrors(errors);

      if (!Object.values(errors).some(Boolean)) {
        setLoading(true);

        if (gid && user && authid) {
          const ref: DocumentReference<DocumentData> = groupDiscussionsRef(gid).doc();
          const updatedDiscussion: Partial<DiscussionModel> = {
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
          }).then((): void => {
            extractMuids(discussion.text)?.forEach((muid: string): void => {
              if (followers?.some(follower => follower.uid === muid)) {   
                const discussantURL = `/dashboard/${authid}`;
                const discussantDisplayName: string = truncateString(user.displayName.split(' ')[0], 12);
                const groupURL = `/group/${gid}`;
                const groupTitle: string = group?.title || '';
                const noteMsg = `<a href='${discussantURL}'>${discussantDisplayName}</a> ti ha menzionato nel gruppo <a href='${groupURL}'>${groupTitle}</a>`;
                const newNoteRef: DocumentReference<DocumentData> = notesRef(muid).doc();
                
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
                }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
              }
            });

          }).catch((err: FirestoreError): void => {
            openSnackbar(handleFirestoreError(err), 'error');
          }).finally((): void => {
            setLoading(false);
            setChanges(false);
            setErrors({});
            setDiscussion(initialDiscussionState as DiscussionModel);
            setLeftChars({ text: null, title: null });
          });
        } else console.warn('No gid or user');
      }
    }
  };

  const onChangeMaxChars = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    e.persist();
    const { name, value } = e.target;
    
    if (snackbarIsOpen) closeSnackbar(e);
    setDiscussion({ ...discussion, [name]: value });
    setErrors({ ...errors, [name]: undefined }); 
    setLeftChars({ ...leftChars, [name]: max.chars[name as keyof MaxModel['chars']] - value.length });
    setChanges(true);
  };

  const onOpenBriefDialog = (): void => setIsOpenBriefDialog(true);

  const onCloseBriefDialog = (): void => setIsOpenBriefDialog(false);

  const onOpenFollowersDialog = (): void => setIsOpenFollowersDialog(true);

  const onCloseFollowersDialog = (): void => setIsOpenFollowersDialog(false);

  const onMentionFollower = (e: MouseEvent): void => {
    const { displayName, fuid } = (e.currentTarget as CurrentTarget).dataset || {};
    const mention = `${discussion.text ? ' ' : ''}@dashboard/${fuid}/${normURL(displayName)} `;

    if (snackbarIsOpen) closeSnackbar(e);
    setDiscussion({ ...discussion, text: discussion.text + mention });
    setErrors({ ...errors, text: undefined }); 
    setLeftChars({ ...leftChars, text: max.chars.text - mention.length });
    setChanges(true);
    setIsOpenFollowersDialog(false);
    setTimeout(() => {
      const ref: HTMLInputElement | null = textInput.current;
      if (ref) {
        ref.selectionStart = 10000;
        ref.selectionEnd = ref.selectionStart;
        ref.focus();
      }
    }, 0);
  };

  return (
    <form className={classnames('card', 'user-discussion', discussion?.text ? 'light' : 'primary')}>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <div className='form-group'>
        <FormControl className='input-field' margin='dense' fullWidth style={formControlStyle}>
          <ThemeProvider theme={discussion?.text ? defaultTheme : primaryTheme}>
            <InputLabel error={Boolean(errors.text)} htmlFor='text'>Il tuo commento</InputLabel>
            <Input
              inputRef={textInput}
              id='text'
              name='text'
              type='text'
              placeholder='Scrivi il tuo commento'
              value={discussion.text || ''}
              onChange={onChangeMaxChars}
              error={Boolean(errors.text)}
              multiline
              endAdornment={(
                <div className='flex' style={{ marginTop: '-8px', }}>
                  {groupFollowers?.length > 0 && (
                    <Tooltip title='Menziona utente'>
                      <button
                        type='button'
                        className='btn sm counter flat icon'
                        onClick={onOpenFollowersDialog}>
                        {icon.account}
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip title='Aiuto per la formattazione'>
                    <button
                      type='button'
                      className='btn sm counter flat icon'
                      onClick={onOpenBriefDialog}>
                      {icon.lifebuoy}
                    </button>
                  </Tooltip>
                  {discussion?.text && (
                    <button
                      type='button'
                      className='btn sm counter primary'
                      onClick={onSubmit}>
                      Pubblica
                    </button>
                  )}
                </div>
              )}
            />
          </ThemeProvider>
          {errors.text && (
            <FormHelperText className='message error'>{errors.text}</FormHelperText>
          )}
          {leftChars.text && leftChars.text < 0 && (
            <FormHelperText className='message warning'>Caratteri in eccesso: {-leftChars.text}</FormHelperText>
          )}
        </FormControl>
      </div>

      {isOpenBriefDialog && (
        <Dialog
          className='dropdown-menu'
          open={isOpenBriefDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseBriefDialog}
          aria-labelledby='brief-dialog-title'
          aria-describedby='brief-dialog-description'>
          <div className='absolute-top-right'>
            <button type='button' className='btn flat rounded icon' aria-label='close' onClick={onCloseBriefDialog}>
              {icon.close}
            </button>
          </div>
          <DialogTitle id='brief-dialog-title'>
            Aiuto per la formattazione
          </DialogTitle>
          <DialogContent id='brief-dialog-description'>
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
          className='dropdown-menu'
          open={isOpenFollowersDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseFollowersDialog}
          aria-labelledby='followers-dialog-title'
        >
          <div className='absolute-top-right'>
            <button type='button' className='btn flat rounded icon' aria-label='close' onClick={onCloseFollowersDialog}>
              {icon.close}
            </button>
          </div>
          <DialogTitle id='followers-dialog-title'>
            Iscritti del gruppo
          </DialogTitle>
          <DialogContent className='dialog' id='followers-dialog-description'>
            <div className='contacts-tab'>
              {groupFollowers?.map(user => (
                <div key={user.uid} className='avatar-row'>
                  <div className='row'>
                    <div className='col-auto'>
                      <Link to={`/dashboard/${user.uid}`}>
                        <Avatar className='avatar' src={user.photoURL} alt={user.displayName}>
                          {!user.photoURL && getInitials(user.displayName)}
                        </Avatar>
                      </Link>
                    </div>
                    <div className='col'>
                      <div className='row'>
                        <Link to={`/dashboard/${user.uid}`} className='col name'>{user.displayName}</Link>
                        {isEditor && (
                          <div className='col-auto'>
                            <button
                              type='button'
                              className='btn sm rounded flat'
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
};
 
export default DiscussionForm;