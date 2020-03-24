import MomentUtils from '@date-io/moment';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from 'moment';
import 'moment/locale/it';
import React, { useContext, useRef, useMemo, useState, useEffect } from 'react';
import { storageRef, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { continents, europeanCountries, italianProvinces, languages, northAmericanCountries } from '../../config/lists';
import { app, calcAge, getInitials, validateImg } from '../../config/shared';
import { userType } from '../../config/types';
import '../../css/profileForm.css';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';

const ProfileForm = props => {
  const { isAdmin, user: contextUser } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [user, setUser] = useState(props.user);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgPreview, setImgPreview] = useState(props.user.photoURL);
  const [imgProgress, setImgProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  // const [authError, setAutherror] = useState('');
  const is = useRef(true);

  const luid = useMemo(() => contextUser?.uid, [contextUser]);
  const uid = useMemo(() => user?.uid, [user]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const setChange = (name, value) => {
    if (is.current) {
      setSaved(false);
      setChanges(true);
      setUser({ ...user, [name]: value });
      setErrors({ ...errors, [name]: null });
    }
  };

  const onChange = e => {
    e.persist();
    const { name, value } = e.target;
    setChange(name, value);
	};

	const onChangeDate = name => date => {
    const value = String(date);
    setChange(name, value);
  };

	const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;
    setChange(name, value);
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
      if (is.current) setLoading(true);

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
          setLoading(false);
          setChanges(false);
          setSaved(true);
          openSnackbar('Modifiche salvate', 'success');
        }
				// setRedirectToReferrer(true);
			}).catch(err => {
        if (is.current) {
          // setAuthError(err.message);
          setLoading(false);
          openSnackbar(err.message, 'error');
        }
			});
		} else openSnackbar('Ricontrolla i dati inseriti', 'error');
  };
  
  // const menuItemsMap = arr => arr.map(item => <MenuItem value={item.id} key={item.id} primaryText={item.name} />);
  const menuItemsMap = (arr, values) => arr.map(item => 
    <MenuItem 
      value={item.name} 
      key={item.id} 
      checked={values ? values.includes(item.name) : false}>
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
              {imgLoading ? 
                <div aria-hidden="true" className="loader"><CircularProgress /></div>
              : 
                <div className="overlay">
                  <span title="Carica un'immagine">+</span>
                  <input type="file" accept="image/*" className="upload" onChange={onImageChange}/>
                </div>
              }
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
            <div className="col-6 form-group">
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

            <div className="col-6 form-group">
              <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="it">
                <DatePicker 
                  className="date-picker"
                  name="birth_date"
                  cancelLabel="Annulla"
                  leftArrowIcon={icon.chevronLeft}
                  rightArrowIcon={icon.chevronRight}
                  format="D MMMM YYYY"
                  minDate={new Date().setFullYear(new Date().getFullYear() - 120)}
                  minDateMessage="E chi sei.. Matusalemme?"
                  maxDate={new Date().setFullYear(new Date().getFullYear() - 14)}
                  maxDateMessage="Età minima 14 anni"
                  label="Data di nascita"
                  value={user.birth_date ? new Date(user.birth_date) : null}
                  onChange={onChangeDate("birth_date")}
                  margin="normal"
                  animateYearScrolling
                  fullWidth
                />
              </MuiPickersUtilsProvider>
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

          <div className="form-group">
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
            <div className="form-group">
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

          <div>&nbsp;</div>

          {luid === uid && <FormHelperText className="message">Per cancellare l&apos;account scrivi a <a href={`mailto:${app.email}?subject=Biblo: cancellazione account utente`}>{app.email}</a>.</FormHelperText>}

          <div>&nbsp;</div>

        </form>
      </div>
      <div className="footer no-gutter">
        <button type="button" className={`btn btn-footer primary ${saved && !changes && 'success'}`} disabled={!changes && 'disabled'} onClick={onSubmit}>{saved ? 'Modifiche salvate' : 'Salva le modifiche'}</button>
      </div>
    </>
  );
}

ProfileForm.propTypes = {
  user: userType.isRequired
}
 
export default ProfileForm;