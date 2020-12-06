import MomentUtils from '@date-io/moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { DatePicker, LocalizationProvider } from "@material-ui/pickers";
import moment from 'moment';
import 'moment/locale/it';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { userBookRef } from '../../config/firebase';
import icon from '../../config/icons';
import { readingStates } from '../../config/lists';
import { handleFirestoreError } from '../../config/shared';
import { funcType, numberType, shapeType, stringType } from '../../config/proptypes';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import Overlay from '../overlay';
import Stepper from '../stepper';

moment.locale('it');

const steps = 20;

const min = {
  start_num: new Date(1970, 0, 1)
};

const max = {};

const ReadingStateForm = ({ bid, onToggle, pages, readingState }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [progress_num, setProgress_num] = useState(readingState.progress_num || (readingState.state_num === 3 ? 100 : 0));
  const [state_num, setState_num] = useState(readingState.state_num);
  const [start_num, setStart_num] = useState(readingState.start_num || null);
  const [end_num, setEnd_num] = useState(readingState.end_num || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [changes, setChanges] = useState(false);
  const is = useRef(true);

  min.end_num = useMemo(() => new Date(start_num || min.start_num), [start_num]);

  max.start_num = useMemo(() => state_num === 3 ? end_num ? new Date(end_num) : new Date : new Date, [end_num, state_num]);

  useEffect(() => {
    if (is.current) {
      if (progress_num === 0) setState_num(1);
      if (progress_num === 100) setState_num(3);
      // setChanges(true);
    }
  }, [progress_num]);

  useEffect(() => {
    if (is.current) {
      if (state_num === 1) {
        setProgress_num(0);
        setStart_num(null);
        setEnd_num(null);
      }
      if (state_num === 2) {
        setEnd_num(null);
        if (progress_num === 100 || progress_num === 0) {
          setProgress_num(100 / steps);
        }
      }
      if (state_num === 3) setProgress_num(100);
      // setChanges(true);
    }
    // eslint-disable-next-line
  }, [state_num]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onChangeSelect = name => e => {
    const { value } = e.target;
    if (is.current) {
      if (name === 'state_num') setState_num(value);
      setErrors({});
      setChanges(true);
    }
  };
  
  const errorMessages = name => ({
    disableFuture: "Data futura non valida",
    disablePast: "Data passata non valida",
    invalidDate: "Data non valida",
    minDate: `Data non valida prima del ${new Date(min[name]).toLocaleDateString()}`,
    maxDate: `Data non valida oltre il ${new Date(max[name]).toLocaleDateString()}`
  });

  const onChangeDate = name => date => {
    const time = new Date(date).getTime();
    if (is.current) {
      if (name === 'start_num') setStart_num(time);
      if (name === 'end_num') setEnd_num(time);
      if (Number.isNaN(Number(time))) {
        setErrors({ ...errors, [name]: errorMessages(name).invalidDate });
      } else {
        setErrors({});
        setChanges(true);
      }
    }
  };

  const onSetDatePickerError = (name, reason) => {
    if (reason) {
      setErrors(errors => ({ ...errors, [name]: errorMessages(name)[reason] }));
    }
  };

  const onSubmit = e => {
    e.preventDefault();
    if (changes) {
      if (Object.keys(errors).length === 0) {
        if (is.current) setLoading(true);
        userBookRef(user.uid, bid).update({
          'readingState.state_num': state_num,
          'readingState.start_num': start_num,
          'readingState.end_num': end_num,
          'readingState.progress_num': progress_num
        }).then(() => {
          // console.log(`UserBook readingState updated`);
          onToggle();
        }).catch(err => {
          openSnackbar(handleFirestoreError(err), 'error');
        }).finally(() => {
          if (is.current) setLoading(false);
        });
      }
    } else onToggle();
  }

  const onNext = () => setProgress_num(progress_num + (100/steps));

  const onPrev = () => setProgress_num(progress_num - (100/steps));

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="reading state" className="dialog light reading-state" ref={is}>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel htmlFor="state_num">Stato lettura</InputLabel>
                <Select
                  id="state_num"
                  value={state_num}
                  onChange={onChangeSelect('state_num')}>
                  {readingStates.map((item, i) => <MenuItem key={i + 1} value={i + 1}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
          {(state_num === 2 || state_num === 3) && (
            <>
              <div className="row">
                <div className={`form-group ${state_num === 3 ? `col-6` : `col-12`}`}>
                  <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale="it">
                    <DatePicker 
                      className="date-picker"
                      name="start_num"
                      cancelLabel="Annulla"
                      leftArrowIcon={icon.chevronLeft}
                      rightArrowIcon={icon.chevronRight}
                      inputFormat="DD/MM/YYYY"
                      invalidDateMessage="Data non valida"
                      minDate={min.start_num}
                      maxDate={max.start_num}
                      label="Data di inizio"
                      todayLabel="Oggi"
                      showTodayButton
                      autoOk
                      disableFuture
                      value={start_num ? new Date(start_num) : null}
                      onChange={onChangeDate('start_num')}
                      onError={reason => onSetDatePickerError('start_num', reason)}
                      renderInput={props => (
                        <TextField {...props} margin="normal" fullWidth helperText={errors.start_num} />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                {state_num === 3 && (
                  <div className="form-group col-6">
                    <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale="it">
                      <DatePicker 
                        className="date-picker"
                        name="end_num"
                        cancelLabel="Annulla"
                        leftArrowIcon={icon.chevronLeft}
                        rightArrowIcon={icon.chevronRight}
                        inputFormat="DD/MM/YYYY"
                        invalidDateMessage="Data non valida"
                        minDate={new Date(start_num || min.start_num)}
                        // minDateMessage={`Data minima ${new Date(start_num || min.start_num).toLocaleDateString()}`}
                        // maxDateMessage="Data futura non valida"
                        label="Data di fine"
                        todayLabel="Oggi"
                        showTodayButton
                        autoOk
                        disableFuture
                        disabled={state_num !== 3}
                        value={end_num ? new Date(end_num) : null}
                        onChange={onChangeDate('end_num')}
                        onError={reason => onSetDatePickerError('end_num', reason)}
                        renderInput={props => (
                          <TextField {...props} margin="normal" fullWidth helperText={errors.end_num} />
                        )}
                      />
                    </LocalizationProvider>
                  </div>
                )}
              </div>
              {state_num === 2 && (
                <Stepper
                  value={progress_num} 
                  onPrev={onPrev} 
                  onNext={onNext}
                  max={pages}
                  steps={steps}
                  className="form-control" 
                />
              )}
            </>
          )}
        </div>
        <div className="footer no-gutter">
          <button
            type="button"
            className="btn btn-footer primary"
            onClick={onSubmit}
            disabled={Object.keys(errors).length > 0}>
            Salva le modifiche
          </button>
        </div>
      </div>
    </>
  )
};

ReadingStateForm.propTypes = {
  bid: stringType.isRequired,
  onToggle: funcType.isRequired,
  pages: numberType,
  readingState: shapeType({
    state_num: numberType.isRequired,
    start_num: numberType,
    end_num: numberType,
    progress_num: numberType
  }).isRequired
}

ReadingStateForm.defaultProps = {
  pages: null
}
 
export default ReadingStateForm;