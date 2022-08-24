import { DocumentData } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import classnames from 'classnames';
import React, { ChangeEvent, FC, FormEvent, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { noteRef, notesRef } from '../../config/firebase';
import { noteTypes } from '../../config/lists';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';

interface MaxModel {
  chars: Record<'text' | 'password', number>;
}

interface MinModel {
  chars: Record<'text', number>;
}

const max: MaxModel = {
  chars: {
    text: 280,
    password: 50
  }
};

const min: MinModel = {
  chars: { text: 10 }
};

interface NoteFormProps {
  nid?: string;
  onToggle: (id?: string, el?: string) => void;
  uid: string;
}

type ErrorsModel = Partial<Record<'text' | 'tag', string>>;

interface DataModel {
  'text': string;
  'tag': string[];
}

const NoteForm: FC<NoteFormProps> = ({
  nid,
  onToggle,
  uid,
}: NoteFormProps) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [data, setData] = useState<DataModel>({ text: '', tag: [] });
  const [changes, setChanges] = useState<boolean>(false);
  const [leftChars, setLeftChars] = useState<Record<'text', number | null>>({ text: null });
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorsModel>({});

  const fetch = useCallback(() => {
    if (nid && uid) {
      setLoading(true);
      
      noteRef(uid, nid).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          setData(snap.data());
        }
      }).catch((err: Error): void => {
        console.warn(err);
      }).finally((): void => {
        setLoading(false);
      });
    }
  }, [nid, uid]);

  const onChangeMaxChars = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setChanges(true);
    setData({ ...data, [name]: value });
    setLeftChars({ ...leftChars, [name]: max.chars[name as keyof MaxModel['chars']] - String(value).length });
    setErrors({ ...errors, [name]: null });
  };

  const onChangeSelect = (e: ChangeEvent<{ name?: string | undefined; value: unknown }>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setData({ ...data, [name]: value });
    setErrors({ ...errors, [name]: null });
  };

  const validate = (data: DataModel): ErrorsModel => {
    const errors: ErrorsModel = {};
    
    if (!data.text) { 
      errors.text = 'Inserisci il testo'; 
    } else if (data.text?.length > max.chars.text) {
      errors.text = `Lunghezza massima ${max.chars.text} caratteri`;
    } else if (data.text?.length < min.chars.text) {
      errors.text = `Lunghezza minima ${min.chars.text} caratteri`;
    }
    if (!data.tag) { 
      errors.tag = 'Scegli un tag'; 
    }
    return errors;
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();

    if (changes) {
      setLoading(true);
      const errors = validate(data);
      
      setErrors(errors);
      
      if (Object.keys(errors).length === 0) {
        setLoading(true);
        
        // console.log(`Sending notification to ${uid}`);
        const newNoteRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData> = notesRef(uid).doc();
        const ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData> = nid ? noteRef(uid, nid) : newNoteRef;
        // if (!nid) { notesRef(uid).set({ count: 0 }) }
        ref.set({
          nid: nid || newNoteRef.id,
          text: data.text,
          created_num: Date.now(),
          createdBy: user?.displayName,
          createdByUid: user?.uid,
          tag: data.tag,
          read: false,
          uid
        }).then((): void => {
          onToggle();
          setData({ ...data, text: '' });
          openSnackbar(nid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
        }).catch((err: Error): void => {
          console.warn(err);
        }).finally((): void => {
          setLoading(false);
        });
      } else setLoading(false);
    } else onToggle();
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const menuItemsMap = (arr: any[], values?: string[]) => arr.map((item: any) => (
    <MenuItem 
      value={item} 
      key={item} 
      // insetChildren={Boolean(values)} 
      selected={values ? values.includes(item) : false}>
      {item}
    </MenuItem>
  ));

  return (
    <Fragment>
      <Overlay onClick={() => onToggle()} />
      <div role='dialog' aria-describedby='new note' className='dialog light'>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <div className='content'>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.text)} htmlFor='text'>Testo della notifica</InputLabel>
                <Input
                  id='text'
                  name='text'
                  type='text'
                  autoFocus
                  placeholder={`Inserisci il testo (max ${max.chars.text} caratteri)...`}
                  value={data.text}
                  onChange={onChangeMaxChars}
                  maxRows={8}
                  multiline
                  error={Boolean(errors.text)}
                />
                {errors.text && <FormHelperText className='message error'>{errors.text}</FormHelperText>}
                {(leftChars.text !== null) && (
                  <FormHelperText className={classnames('message', leftChars.text < 0 ? 'warning' : 'neutral')}>
                    Caratteri rimanenti: {leftChars.text}
                  </FormHelperText>
                )}
              </FormControl>
            </div>
          </div>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.tag)} htmlFor='tag'>Tag</InputLabel>
                <Select
                  id='tag'
                  error={Boolean(errors.tag)}
                  value={data.tag}
                  onChange={onChangeSelect}
                  multiple
                  name='tag'
                >
                  {menuItemsMap(noteTypes, data.tag)}
                </Select>
                {errors.tag && <FormHelperText className='message error'>{errors.tag}</FormHelperText>}
              </FormControl>
            </div>
          </div>
        </div>
        <div className='footer no-gutter'>
          <button type='button' className='btn btn-footer primary' onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </Fragment>
  );
};
 
export default NoteForm;