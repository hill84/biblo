import MomentUtils from '@date-io/moment';
import { Badge } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers';
import classnames from 'classnames';
import type { storage } from 'firebase';
import moment from 'moment';
import type { ChangeEvent, FC, FormEvent, ReactText } from 'react';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { storageRef, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import type { ListModel } from '../../config/lists';
import { continents, europeanCountries, italianProvinces, languages, northAmericanCountries } from '../../config/lists';
import { app, calcAge, getInitials, urlRegex, validateImg } from '../../config/shared';
import type { SnackbarContextModel } from '../../context/snackbarContext';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/profileForm.css';
import i18n from '../../i18n';
import type { IsCurrent, UserContextModel, UserModel } from '../../types';

const min: Record<string, number> = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 120)
};

const max: Record<string, number> = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 14)
};

interface ProfileFormProps {
  user: UserModel;
}

interface StateModel {
  imgLoading: boolean;
  imgPreview: string;
  imgProgress: number;
  loading: boolean;
  changes: boolean;
  saved: boolean;
  errors: Record<string, ReactText | null>;
  isEditingSocial: boolean;
}

const initialState: StateModel = {
  imgLoading: false,
  imgPreview: '',
  imgProgress: 0,
  loading: false,
  changes: false,
  saved: false,
  errors: {},
  isEditingSocial: false,
};

const ProfileForm: FC<ProfileFormProps> = ({ user: _user }: ProfileFormProps) => {
  const { isAdmin, user: contextUser } = useContext<UserContextModel>(UserContext);
  const { openSnackbar } = useContext<SnackbarContextModel>(SnackbarContext);
  const [user, setUser] = useState<UserModel>(_user);
  const [imgLoading, setImgLoading] = useState<boolean>(initialState.imgLoading);
  const [imgPreview, setImgPreview] = useState<string>(user.photoURL);
  const [imgProgress, setImgProgress] = useState<number>(initialState.imgProgress);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [changes, setChanges] = useState<boolean>(initialState.changes);
  const [saved, setSaved] = useState<boolean>(initialState.saved);
  const [errors, setErrors] = useState<Record<string, ReactText | null>>(initialState.errors);
  const [isEditingSocial, setIsEditingSocial] = useState<boolean>(initialState.isEditingSocial);

  const { t } = useTranslation(['form', 'lists']);

  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
    return () => { is.current = false };
  }, []);

  const luid: string | undefined = contextUser?.uid;
  const uid: string = user?.uid;

  const setChange = useCallback((name: string, value: unknown): void => {
    setUser({ ...user, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    setSaved(false);
    setChanges(true);
  }, [errors, user]);

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    setChange(name, value);
  };

  const onChangeSelect = (e: ChangeEvent<{ name?: string; value: unknown }>): void => {
    e.persist();
    const { name, value } = e.target;
    if (!name) return;
    setChange(name, value);
  };

  const onChangeDate = useCallback((name: string) => (date: Date | null): void => {
    const value: string = date ? String(date) : '';
    setChange(name, value);
  }, [setChange]);

  const onSetDatePickerError = (name: string, reason: string): void => {
    const errorMessages: Record<string, string> = {
      disableFuture: t('ERROR_INVALID_FUTURE_DATE'),
      disablePast: t('ERROR_INVALID_PAST_DATE'),
      invalidDate: t('ERROR_INVALID_DATE'),
      minDate: t('ERROR_MIN_DATE', { number: min[name] }),
      maxDate: t('ERROR_MAX_DATE', { number: max[name] }),
    };
    
    setErrors(errors => ({ ...errors, [name]: errorMessages[reason] }));
  };

  const validate = (user: UserModel) => {
    const errors: Record<string, string> = {};

    if (!user.displayName) errors.displayName = t('ERROR_REQUIRED_FIELD');
    if (new Date(user.birth_date).getTime() > new Date().getTime()) { 
      errors.birth_date = t('ERROR_INVALID_DATE'); 
    } else if (calcAge(user.birth_date) < 14) { 
      errors.birth_date = t('ERROR_MIN_COUNT_AGE', { count: 14 }); 
    } else if (calcAge(user.birth_date) >= 130) {
      errors.birth_date = t('ERROR_MAX_COUNT_AGE', { count: 130 }); 
    }
    if (user.city?.length > 150) errors.city = t('ERROR_MAX_COUNT_CHARACTERS', { count: 150 });
    if (user.website && !user.website.match(urlRegex)) errors.website = t('ERROR_INVALID_URL');
    if (user.youtube?.includes('youtube.com')) errors.youtube = t('ERROR_REMOVE_STRING', { string: 'https://www.youtube.com/channel/' });
    if (user.instagram?.includes('instagram.com')) errors.instagram = t('ERROR_REMOVE_STRING', { string: 'https://www.instagram.com/' });
    if (user.twitch?.includes('twitch.tv')) errors.twitch = t('ERROR_REMOVE_STRING', { string: 'https://www.twitch.tv/' });
    if (user.facebook?.includes('facebook.com')) errors.facebook = t('ERROR_REMOVE_STRING', { string: 'https://www.facebook.com/' });
    return errors;
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const file: File | undefined = e.target.files?.[0];
    
    if (file) {
      const error: string | undefined = validateImg(file, 1);
  
      if (!error) {
        setImgLoading(true);
        setErrors({ ...errors, upload: null });
        const uploadTask: storage.UploadTask = storageRef.child(`users/${uid}/avatar`).put(file);
        const unsubUploadTask: Function = uploadTask.on('state_changed', (snap: storage.UploadTaskSnapshot): void => {
          setImgProgress((snap.bytesTransferred / snap.totalBytes) * 100);
        }, (err: Error): void => {
          // console.warn(`Upload error: ${error.message}`);
          setErrors({ ...errors, upload: err.message });
          setImgLoading(false);
          setImgProgress(0);
          openSnackbar(err.message, 'error');
        }, (): void => {
          // console.log('upload completed');
          uploadTask.then((snap: storage.UploadTaskSnapshot): void => {
            snap.ref.getDownloadURL().then((url: string): void => {
              if (is.current) {
                setImgLoading(false);
                setImgPreview(url);
                setChanges(true);
                setSaved(false);
                openSnackbar(t('SUCCESS_IMAGE_UPLOADED'), 'success');
              }
            });
          });
          unsubUploadTask();
        });
      } else {
        setErrors({ ...errors, upload: error });
        openSnackbar(error, 'error');
        setTimeout((): void => {
          setErrors({ ...errors, upload: null });
        }, 2000);
      }
    }
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const errors: Record<string, string | number> = validate(user);
    
    setErrors(errors);
    
    if (!Object.values(errors).some(Boolean)) {
      setLoading(true);
      setIsEditingSocial(false);

      userRef(uid).set({
        ...user,
        photoURL: imgPreview || '',
        sex: user.sex || '',
        birth_date: user.birth_date || '',
        city: user.city || '',
        country: user.country || ''
      }).then((): void => {
        if (is.current) {
          setImgProgress(0);
          setChanges(false);
          setSaved(true);
          openSnackbar(t('SUCCESS_CHANGES_SAVED'), 'success');
          // setRedirectToReferrer(true);
        }
      }).catch((err: Error): void => {
        openSnackbar(err.message, 'error');
      }).finally((): void => {
        setLoading(false);
      });
    } else openSnackbar(t('ERROR_SUBMIT'), 'error');
  };

  const onToggleSocial = (): void => setIsEditingSocial(isEditingSocial => !isEditingSocial);
  
  const menuItemsMap = (arr: ListModel[], root?: string) => arr.map(({ name, native, label, id }: ListModel) => (
    <MenuItem
      value={name}
      title={label}
      key={id}>
      {label && root ? t(`lists:${root}_${label}`) : native || name}
    </MenuItem>
  ));
  
  // if (!user) return null;

  return (
    <>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <div className='container sm' ref={is}>
        <div className='row basic-profile'>
          
          <div className='col-auto'>
            <Badge badgeContent='+' color='primary' className='avatar-badge'>
              <div className={classnames('upload-avatar', errors.upload ? 'error' : imgProgress === 100 ? 'success' : null)}>
                <Avatar className='avatar' src={imgPreview} alt={user.displayName}>
                  {!imgPreview && getInitials(user.displayName)}
                </Avatar>
                {imgLoading ? (
                  <div aria-hidden='true' className='loader'><CircularProgress /></div>
                ) : (
                  <div className='overlay'>
                    <span title="Carica un'immagine">+</span>
                    <input type='file' accept='image/*' className='upload' onChange={onImageChange}/>
                  </div>
                )}
              </div>
            </Badge>
          </div>
          <div className='col'>
            <div className='username'>{user.displayName || 'Innominato'}</div>
            <div className='email'>{user.email}</div>
          </div>
        </div>

        <div>&nbsp;</div>

        <form onSubmit={onSubmit} noValidate>
          <div className='form-group'>
            <FormControl className='input-field' margin='normal' fullWidth>
              <InputLabel error={Boolean(errors.displayName)} htmlFor='displayName'>
                {t('LABEL_DISPLAY_NAME')}
              </InputLabel>
              <Input
                id='displayName'
                name='displayName'
                type='text'
                placeholder='es: Mario Rossi'
                value={user.displayName || ''}
                readOnly={!isAdmin}
                onChange={onChange}
                error={Boolean(errors.displayName)}
              />
              {!isAdmin && (
                user.displayName && (
                  <FormHelperText className='message'>
                    {t('HELPER_EDIT_DISPLAY_NAME')} <a href={`mailto:${app.email}?subject=Biblo: modifica nominativo utente`}>{app.email}</a>.
                  </FormHelperText>
                )
              )}
              {errors.displayName && (
                <FormHelperText className='message error'>
                  {errors.displayName}
                </FormHelperText>
              )}
            </FormControl>
          </div>

          <div className='row'>
            <div className='col form-group'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.sex)} htmlFor='sex'>{t('LABEL_SEX')}</InputLabel>
                <Select
                  id='sex'
                  placeholder={t('PLACEHOLDER_EG_STRING', { string: t('common:SEX_F') })}
                  name='sex'
                  value={user.sex || ''}
                  onChange={onChangeSelect}
                  error={Boolean(errors.sex)}>
                  <MenuItem key='m' value='m'>{t('common:SEX_M')}</MenuItem>
                  <MenuItem key='f' value='f'>{t('common:SEX_F')}</MenuItem>
                  <MenuItem key='x' value='x'>{t('common:SEX_X')}</MenuItem>
                </Select>
                {errors.sex && <FormHelperText className='message error'>{errors.sex}</FormHelperText>}
              </FormControl>
            </div>

            <div className='col form-group'>
              <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale={i18n.language}>
                <DatePicker 
                  className='date-picker'
                  cancelText={t('common:ACTION_CANCEL')}
                  leftArrowIcon={icon.chevronLeft}
                  rightArrowIcon={icon.chevronRight}
                  // inputFormat='DD/MM/YYYY'
                  // invalidDateMessage={t('ERROR_INVALID_DATE')}
                  minDate={min.birth_date}
                  maxDate={max.birth_date}
                  // minDateMessage='Chi sei? ...Matusalemme?'
                  // maxDateMessage='Età minima 14 anni'
                  label={t('LABEL_BIRTH_DATE')}
                  // autoOk
                  value={user.birth_date ? new Date(user.birth_date) : null}
                  onChange={onChangeDate('birth_date')}
                  onError={reason => onSetDatePickerError('birth_date', reason || '')}
                  renderInput={props => (
                    <TextField {...props} margin='normal' fullWidth helperText={errors.birth_date} />
                  )}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className='form-group'>
            <FormControl className='select-field' margin='normal' fullWidth>
              <InputLabel htmlFor='languages'>
                {t('LABEL_KNOWN_LANGUAGES')} {user.languages?.length > 1 ? ` (${user.languages.length})` : ''}
              </InputLabel>
              <Select
                id='languages'
                placeholder='es: Italiano, Spagnolo'
                name='languages'
                value={user.languages || []}
                onChange={onChangeSelect}
                multiple>
                {menuItemsMap(languages)}
              </Select>
            </FormControl>
          </div>

          <div className='row'>
            <div className='col form-group'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel htmlFor='continent'>
                  {t('LABEL_CONTINENT')}
                </InputLabel>
                <Select
                  id='continent'
                  placeholder='es: Europa'
                  name='continent'
                  value={user.continent || ''}
                  onChange={onChangeSelect}>
                  {menuItemsMap(continents, 'CONTINENT')}
                </Select>
              </FormControl>
            </div>

            {(user.continent === 'Europa' || user.continent === 'Nordamerica') && (
              <div className='col form-group'>
                <FormControl className='select-field' margin='normal' fullWidth>
                  <InputLabel htmlFor='country'>
                    {t('LABEL_COUNTRY')}
                  </InputLabel>
                  <Select
                    id='country'
                    placeholder='es: Italia'
                    name='country'
                    value={user.country || ''}
                    onChange={onChangeSelect}>
                    {user.continent === 'Europa' && menuItemsMap(europeanCountries, 'COUNTRY')}
                    {user.continent === 'Nordamerica' && menuItemsMap(northAmericanCountries, 'COUNTRY')}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>

          <div className='form-group'>
            {user.country && user.country === 'Italia' ? (
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel htmlFor='city'>
                  {t('LABEL_PROVINCE')}
                </InputLabel>
                <Select
                  id='city'
                  placeholder='es: Torino'
                  name='city'
                  value={user.city || ''}
                  onChange={onChangeSelect}>
                  {menuItemsMap(italianProvinces)}
                </Select>
              </FormControl>
            ) : (
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.city)} htmlFor='city'>
                  {t('LABEL_CITY')}
                </InputLabel>
                <Input
                  id='city'
                  name='city'
                  type='text'
                  placeholder='es: New York'
                  value={user.city || ''}
                  onChange={onChange}
                  error={Boolean(errors.city)}
                />
                {errors.city && <FormHelperText className='message error'>{errors.city}</FormHelperText>}
              </FormControl>
            )}
          </div>

          {isEditingSocial ? (
            <>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.website)} htmlFor='website'>Sito internet o blog</InputLabel>
                  <Input
                    id='website'
                    name='website'
                    type='url'
                    placeholder={`es: ${app.url}`}
                    value={user.website || ''}
                    onChange={onChange}
                    error={Boolean(errors.website)}
                  />
                  {errors.website && <FormHelperText className='message error'>{errors.website}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.youtube)} htmlFor='youtube'>
                    {t('LABEL_YOUTUBE_CHANNEL')}
                  </InputLabel>
                  <Input
                    id='youtube'
                    name='youtube'
                    type='url'
                    autoComplete='https://www.youtube.com/channel/'
                    placeholder='es: bibloSpace'
                    value={user.youtube || ''}
                    onChange={onChange}
                    error={Boolean(errors.youtube)}
                  />
                  {errors.youtube && <FormHelperText className='message error'>{errors.youtube}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.instagram)} htmlFor='instagram'>
                    {t('LABEL_INSTAGRAM_PROFILE')}
                  </InputLabel>
                  <Input
                    id='instagram'
                    name='instagram'
                    type='url'
                    autoComplete='https://www.instagram.com/'
                    placeholder='es: bibloSpace'
                    value={user.instagram || ''}
                    onChange={onChange}
                    error={Boolean(errors.instagram)}
                  />
                  {errors.instagram && <FormHelperText className='message error'>{errors.instagram}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.twitch)} htmlFor='twitch'>
                    {t('LABEL_TWITCH_CHANNEL')}
                  </InputLabel>
                  <Input
                    id='twitch'
                    name='twitch'
                    type='url'
                    autoComplete='https://www.twitch.tv/'
                    placeholder='es: bibloSpace'
                    value={user.twitch || ''}
                    onChange={onChange}
                    error={Boolean(errors.twitch)}
                  />
                  {errors.twitch && <FormHelperText className='message error'>{errors.twitch}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.facebook)} htmlFor='facebook'>
                    {t('LABEL_FACEBOOK_PAGE')}
                  </InputLabel>
                  <Input
                    id='facebook'
                    name='facebook'
                    type='url'
                    autoComplete='https://www.facebook.com/'
                    placeholder='es: bibloSpace'
                    value={user.facebook || ''}
                    onChange={onChange}
                    error={Boolean(errors.facebook)}
                  />
                  {errors.facebook && <FormHelperText className='message error'>{errors.facebook}</FormHelperText>}
                </FormControl>
              </div>
            </>
          ) : (
            <div className='info-row'>
              <button type='button' className='btn flat rounded centered' onClick={onToggleSocial}>
                {t(`common:${(user.website || user.youtube || user.instagram || user.twitch || user.facebook) ? 'ACTION_EDIT' : 'ACTION_ADD'}`)} {t('common:SOCIAL_PROFILES').toLowerCase()}
              </button>
            </div>
          )}
          
          <div>&nbsp;</div>

          {luid === uid && (
            <FormHelperText className='message'>
              {t('common:TO_DELETE_YOUR_ACCOUNT_WRITE_TO')} <a href={`mailto:${app.email}?subject=Biblo: cancellazione account utente`}>{app.email}</a>.
            </FormHelperText>
          )}

        </form>
      </div>
      <div className='footer no-gutter'>
        <button
          type='button'
          className={classnames('btn', 'btn-footer', saved && !changes ? 'success' : 'primary')}
          disabled={!changes}
          onClick={onSubmit as (e: FormEvent) => void}
        >
          {t(`common:${saved ? 'ACTION_SAVED' : 'ACTION_SAVE'}`)}
        </button>
      </div>
    </>
  );
};

export default ProfileForm;