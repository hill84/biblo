import MomentUtils from '@date-io/moment';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import moment from 'moment';
import 'moment/locale/it';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storageRef, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { continents, europeanCountries, italianProvinces, languages, northAmericanCountries } from '../../config/lists';
import { app, calcAge, getInitials, urlRegex, validateImg } from '../../config/shared';
import { userType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/profileForm.css';

moment.locale('it');

const min = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 120)
};

const max = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 14)
};

const ProfileForm = ({ user: _user }) => {
  const { isAdmin, user: contextUser } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [user, setUser] = useState(_user);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState(user.photoURL);
  const [imgProgress, setImgProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditingSocial, setIsEditingSocial] = useState(false);
  const is = useRef(true);

  const luid = useMemo(() => contextUser?.uid, [contextUser]);
  const uid = useMemo(() => user?.uid, [user]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const setChange = (name, value) => {
    setUser({ ...user, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    setSaved(false);
    setChanges(true);
  };

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;
    setChange(name, value);
  };

  const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;
    setChange(name, value);
  };

  const onChangeDate = name => date => {
    const value = String(date);
    setChange(name, value);
  };

  const onSetDatePickerError = (name, reason) => {
    const errorMessages = {
      disableFuture: "Data futura non valida",
      disablePast: "Data passata non valida",
      invalidDate: "Data non valida",
      minDate: `Data non valida prima del ${new Date(min[name]).toLocaleDateString()}`,
      maxDate: `Data non valida oltre il ${new Date(max[name]).toLocaleDateString()}`
    };
    
    setErrors(errors => ({ ...errors, [name]: errorMessages[reason] }));
  };

  const validate = user => {
    const errors = {};

    if (!user.displayName) errors.displayName = "Inserisci un nome utente";
    if (Date(user.birth_date) > new Date()) { 
      errors.birth_date = "Data di nascita non valida" 
    } else if (calcAge(user.birth_date) < 13) { 
      errors.birth_date = "Età minima 14 anni"; 
    } else if (calcAge(user.birth_date) > 119) {
      errors.birth_date = "E chi sei.. Matusalemme?"; 
    }
    if (user.city?.length > 150) errors.city = "Lunghezza massima 150 caratteri";
    if (user.website && !user.website.match(urlRegex)) errors.website = "URL non valido";
    if (user.youtube?.includes('youtube.com')) errors.youtube = `Rimuovi "https://www.youtube.com/channel/"`;
    if (user.instagram?.includes('instagram.com')) errors.instagram = `Rimuovi "https://www.instagram.com/"`;
    if (user.twitch?.includes('twitch.tv')) errors.twitch = `Rimuovi "https://www.twitch.tv/"`;
    if (user.facebook?.includes('facebook.com')) errors.facebook = `Rimuovi "https://www.facebook.com/"`;
    return errors;
  };

  const onImageChange = e => {
    e.preventDefault();
    const file = e.target.files[0];
    
    if (file) {
      const error = validateImg(file, 1);
  
      if (!error) {
        if (is.current) {
          setImgLoading(true);
          setErrors({ ...errors, upload: null });
        }
        const uploadTask = storageRef.child(`users/${uid}/avatar`).put(file);
        const unsubUploadTask = uploadTask.on('state_changed', snap => {
          if (is.current) {
            setImgProgress((snap.bytesTransferred / snap.totalBytes) * 100);
          }
        }, err => {
          // console.warn(`Upload error: ${error.message}`);
          if (is.current) {
            setErrors({ ...errors, upload: err.message });
            setImgLoading(false);
            setImgProgress(0);
            openSnackbar(err.message, 'error');
          }
        }, () => {
          // console.log('upload completed');
          uploadTask.then(snap => {
            snap.ref.getDownloadURL().then(url => {
              if (is.current) {
                setImgLoading(false);
                setImgPreview(url);
                setChanges(true);
                setSaved(false);
                openSnackbar('Immagine caricata', 'success');
              }
            });
          });
          unsubUploadTask();
        });
      } else if (is.current) {
        setErrors({ ...errors, upload: error });
        openSnackbar(error, 'error');
        setTimeout(() => {
          if (is.current) {
            setErrors({ ...errors, upload: null });
          }
        }, 2000);
      }
    }
  };
  
  const onSubmit = e => {
    e.preventDefault();
    const errors = validate(user);
    
    if (is.current) setErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      if (is.current) {
        setLoading(true);
        setIsEditingSocial(false);
      }

      userRef(uid).set({
        ...user,
        photoURL: imgPreview || '',
        sex: user.sex || '',
        birth_date: user.birth_date || '',
        city: user.city || '',
        country: user.country || ''
      }).then(() => {
        if (is.current) {
          setImgProgress(0);
          setChanges(false);
          setSaved(true);
          openSnackbar('Modifiche salvate', 'success');
        }
        // setRedirectToReferrer(true);
      }).catch(err => {
        if (is.current) {
          openSnackbar(err.message, 'error');
        }
      }).finally(() => {
        if (is.current) setLoading(false);
      });
    } else openSnackbar('Ricontrolla i dati inseriti', 'error');
  };

  const onToggleSocial = () => setIsEditingSocial(isEditingSocial => !isEditingSocial);
  
  const menuItemsMap = (arr, values) => arr.map(item => 
    <MenuItem 
      value={item.name}
      title={item.nativeName}
      key={item.id}
      checked={values?.includes(item.name)}>
      {item.name}
    </MenuItem>
  );
  
  // if (!user) return null;

  return (
    <>
      {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      <div className="container sm" ref={is}>
        <div className="row basic-profile">
          
          <div className="col-auto">
            <div className={`upload-avatar ${errors.upload ? 'error' : imgProgress === 100 ? 'success' : ''}`}>
              <Avatar className="avatar" src={imgPreview} alt={user.displayName}>{!imgPreview && getInitials(user.displayName)}</Avatar>
              {imgLoading ? (
                <div aria-hidden="true" className="loader"><CircularProgress /></div>
              ) : (
                <div className="overlay">
                  <span title="Carica un'immagine">+</span>
                  <input type="file" accept="image/*" className="upload" onChange={onImageChange}/>
                </div>
              )}
            </div>
          </div>
          <div className="col">
            <div className="username">{user.displayName || 'Innominato'}</div>
            <div className="email">{user.email}</div>
          </div>
        </div>

        <div>&nbsp;</div>

        <form onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <FormControl className="input-field" margin="normal" fullWidth>
              <InputLabel error={Boolean(errors.displayName)} htmlFor="displayName">Nome e cognome</InputLabel>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="es: Mario Rossi"
                value={user.displayName || ''}
                readOnly={!isAdmin}
                onChange={onChange}
                error={Boolean(errors.displayName)}
              />
              {!isAdmin && (
                user.displayName && <FormHelperText className="message">Per modificare il <span className="hide-sm">nominativo</span><span className="show-sm">nome</span> scrivi a <a href={`mailto:${app.email}?subject=Biblo: modifica nominativo utente`}>{app.email}</a>.</FormHelperText>
              )}
              {errors.displayName && <FormHelperText className="message error">{errors.displayName}</FormHelperText>}
            </FormControl>
          </div>

          <div className="row">
            <div className="col form-group">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.sex)} htmlFor="sex">Sesso</InputLabel>
                <Select
                  id="sex"
                  placeholder="es: Femmina"
                  value={user.sex || ''}
                  onChange={onChangeSelect("sex")}
                  error={Boolean(errors.sex)}>
                  <MenuItem key="m" value="m">Uomo</MenuItem>
                  <MenuItem key="f" value="f">Donna</MenuItem>
                  <MenuItem key="x" value="x">Altro</MenuItem>
                </Select>
                {errors.sex && <FormHelperText className="message error">{errors.sex}</FormHelperText>}
              </FormControl>
            </div>

            <div className="col form-group">
              <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale="it">
                <DatePicker 
                  className="date-picker"
                  name="birth_date"
                  cancelLabel="Annulla"
                  leftArrowIcon={icon.chevronLeft}
                  rightArrowIcon={icon.chevronRight}
                  inputFormat="DD/MM/YYYY"
                  invalidDateMessage="Data non valida"
                  minDate={min.birth_date}
                  maxDate={max.birth_date}
                  // minDateMessage="Chi sei? ...Matusalemme?"
                  // maxDateMessage="Età minima 14 anni"
                  label="Data di nascita"
                  autoOk
                  value={user.birth_date ? new Date(user.birth_date) : null}
                  onChange={onChangeDate('birth_date')}
                  onError={reason => onSetDatePickerError('birth_date', reason)}
                  renderInput={props => (
                    <TextField {...props} margin="normal" fullWidth helperText={errors.birth_date} />
                  )}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="form-group">
            <FormControl className="select-field" margin="normal" fullWidth>
              <InputLabel htmlFor="languages">{`Lingue conosciute ${user.languages?.length > 1 ? ` (${user.languages.length})` : ""}`}</InputLabel>
              <Select
                id="languages"
                placeholder="es: Italiano, Spagnolo"
                value={user.languages || []}
                onChange={onChangeSelect("languages")}
                multiple>
                {menuItemsMap(languages, user.languages)}
              </Select>
            </FormControl>
          </div>

          <div className="row">
            <div className="col form-group">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel htmlFor="continent">Continente</InputLabel>
                <Select
                  id="continent"
                  placeholder="es: Europa"
                  value={user.continent || ''}
                  onChange={onChangeSelect("continent")}>
                  {menuItemsMap(continents)}
                </Select>
              </FormControl>
            </div>

            {(user.continent === 'Europa' || user.continent === 'Nordamerica') && (
              <div className="col form-group">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel htmlFor="nation">Nazione</InputLabel>
                  <Select
                    id="nation"
                    placeholder="es: Italia"
                    value={user.country || ''}
                    onChange={onChangeSelect("country")}>
                    {user.continent === 'Europa' && menuItemsMap(europeanCountries)}
                    {user.continent === 'Nordamerica' && menuItemsMap(northAmericanCountries)}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>

          <div className="form-group">
            {user.country && user.country === "Italia‎" ? (
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel htmlFor="city">Provincia</InputLabel>
                <Select
                  id="city"
                  placeholder="es: Torino"
                  value={user.city || ''}
                  onChange={onChangeSelect("city")}>
                  {menuItemsMap(italianProvinces)}
                </Select>
              </FormControl>
            ) : (
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.city)} htmlFor="city">Città</InputLabel>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="es: New York"
                  value={user.city || ''}
                  onChange={onChange}
                  error={Boolean(errors.city)}
                />
                {errors.city && <FormHelperText className="message error">{errors.city}</FormHelperText>}
              </FormControl>
            )}
          </div>

          {isEditingSocial ? (
            <>
              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.website)} htmlFor="website">Sito internet o blog</InputLabel>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder={`es: ${app.url}`}
                    value={user.website || ''}
                    onChange={onChange}
                    error={Boolean(errors.website)}
                  />
                  {errors.website && <FormHelperText className="message error">{errors.website}</FormHelperText>}
                </FormControl>
              </div>

              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.youtube)} htmlFor="youtube">Canale Youtube</InputLabel>
                  <Input
                    id="youtube"
                    name="youtube"
                    type="url"
                    autoComplete="https://www.youtube.com/channel/"
                    placeholder="es: bibloSpace"
                    value={user.youtube || ''}
                    onChange={onChange}
                    error={Boolean(errors.youtube)}
                  />
                  {errors.youtube && <FormHelperText className="message error">{errors.youtube}</FormHelperText>}
                </FormControl>
              </div>

              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.instagram)} htmlFor="instagram">Profilo Instagram</InputLabel>
                  <Input
                    id="instagram"
                    name="instagram"
                    type="url"
                    autoComplete="https://www.instagram.com/"
                    placeholder="es: bibloSpace"
                    value={user.instagram || ''}
                    onChange={onChange}
                    error={Boolean(errors.instagram)}
                  />
                  {errors.instagram && <FormHelperText className="message error">{errors.instagram}</FormHelperText>}
                </FormControl>
              </div>

              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.twitch)} htmlFor="twitch">Canale Twitch</InputLabel>
                  <Input
                    id="twitch"
                    name="twitch"
                    type="url"
                    autoComplete="https://www.twitch.tv/"
                    placeholder="es: bibloSpace"
                    value={user.twitch || ''}
                    onChange={onChange}
                    error={Boolean(errors.twitch)}
                  />
                  {errors.twitch && <FormHelperText className="message error">{errors.twitch}</FormHelperText>}
                </FormControl>
              </div>

              <div className="form-group">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.facebook)} htmlFor="facebook">Pagina Facebook</InputLabel>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="url"
                    autoComplete="https://www.facebook.com/"
                    placeholder="es: bibloSpace"
                    value={user.facebook || ''}
                    onChange={onChange}
                    error={Boolean(errors.facebook)}
                  />
                  {errors.facebook && <FormHelperText className="message error">{errors.facebook}</FormHelperText>}
                </FormControl>
              </div>
            </>
          ) : (
            <div className="info-row">
              <button type="button" className="btn flat rounded centered" onClick={onToggleSocial}>
                {(user.website || user.youtube || user.instagram || user.twitch || user.facebook) ? 'Modifica' : 'Aggiungi'} profili social
              </button>
            </div>
          )}
          
          <div>&nbsp;</div>

          {luid === uid && (
            <FormHelperText className="message">
              Per cancellare l&apos;account scrivi a <a href={`mailto:${app.email}?subject=Biblo: cancellazione account utente`}>{app.email}</a>.
            </FormHelperText>
          )}

        </form>
      </div>
      <div className="footer no-gutter">
        <button type="button" className={`btn btn-footer ${saved && !changes ? 'success' : 'primary'}`} disabled={!changes} onClick={onSubmit}>{saved ? 'Modifiche salvate' : 'Salva le modifiche'}</button>
      </div>
    </>
  );
}

ProfileForm.propTypes = {
  user: userType.isRequired
}

export default ProfileForm;