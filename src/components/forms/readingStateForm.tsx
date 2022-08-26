import MomentUtils from '@date-io/moment';
import { FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers';
import classnames from 'classnames';
import moment from 'moment';
import 'moment/locale/it';
import React, { ChangeEvent, FC, FormEvent, Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { userBookRef } from '../../config/firebase';
import icon from '../../config/icons';
import { readingStates } from '../../config/lists';
import { handleFirestoreError } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import { IsCurrent, ReadingStateModel } from '../../types';
import { initialUserBook } from '../book';
import Overlay from '../overlay';
import Stepper from '../stepper';

moment.locale('it');

const steps = 20;

interface ReadingStateFormProps {
  bid: string;
  onToggle: () => void;
  pages?: number;
  readingState: ReadingStateModel;
}

interface ErrorsModel {
  start_num?: string;
  end_num?: string;
}

interface ErrorMessagesModel {
  disableFuture?: string;
  disablePast?: string;
  invalidDate?: string;
  minDate?: string;
  maxDate?: string;
  shouldDisableDate?: string;
}

interface StateModel {
  loading: boolean;
  errors: ErrorsModel;
}

const initialState: StateModel = {
  loading: false,
  errors: {},
};

const ReadingStateForm: FC<ReadingStateFormProps> = ({
  bid,
  onToggle,
  pages,
  readingState = initialUserBook.readingState,
}: ReadingStateFormProps) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [progress_num, setProgress_num] = useState<number>(readingState.progress_num || (readingState.state_num === 3 ? 100 : 0));
  const [state_num, setState_num] = useState<number>(readingState.state_num);
  const [start_num, setStart_num] = useState<number | null>(readingState.start_num || null);
  const [end_num, setEnd_num] = useState<number | null>(readingState.end_num || null);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [errors, setErrors] = useState<ErrorsModel>(initialState.errors);

  const is = useRef<IsCurrent>(false);

  useEffect(() => {
    is.current = true;
    return () => { is.current = false };
  }, []);

  const hasChanges = useMemo((): boolean => {
    return end_num !== readingState.end_num || start_num !== readingState.start_num || state_num !== readingState.state_num || progress_num !== readingState.progress_num;
  }, [end_num, progress_num, readingState.end_num, readingState.progress_num, readingState.start_num, readingState.state_num, start_num, state_num]);

  const min = useMemo((): Record<keyof ErrorsModel, number> => ({
    start_num: 0,
    end_num: start_num || 0,
  }), [start_num]);
  
  const max = useMemo((): Record<keyof ErrorsModel, number | undefined> => ({
    start_num: state_num === 3 ? end_num || new Date().getTime() : new Date().getTime(),
    end_num: 4e12,
  }), [end_num, state_num]);

  useEffect(() => {
    if (progress_num === 0) setState_num(1);
    if (progress_num === 100) setState_num(3);
  }, [progress_num]);

  useEffect(() => {
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
    // eslint-disable-next-line
  }, [state_num]);

  const onChangeSelect = (e: ChangeEvent<{ name?: string; value: unknown }>): void => {
    const { name, value } = e.target;
    if (name === 'state_num') setState_num(Number(value) || initialUserBook.readingState.state_num);
    setErrors(initialState.errors);
  };
  
  const errorMessages = (name: keyof ErrorsModel): ErrorMessagesModel => ({
    disableFuture: 'Data futura non valida',
    disablePast: 'Data passata non valida',
    invalidDate: 'Data non valida',
    minDate: `Data non valida prima del ${new Date(min[name] as number).toLocaleDateString()}`,
    maxDate: `Data non valida oltre il ${new Date(max[name] as number).toLocaleDateString()}`,
  });

  const onChangeDate = (name: keyof ErrorsModel) => (date: Date | null): void => {
    const time: number | null = date ? new Date(date).getTime() : null;
    if (name === 'start_num') setStart_num(time);
    if (name === 'end_num') setEnd_num(time);
    if (Number.isNaN(Number(time))) {
      setErrors({ ...errors, [name]: errorMessages(name).invalidDate });
    } else {
      setErrors(initialState.errors);
    }
  };

  const onSetDatePickerError = (name: keyof ErrorsModel, reason: keyof ErrorMessagesModel): void => {
    if (!reason) return;
    setErrors(errors => ({ ...errors, [name]: errorMessages(name)[reason] }));
  };

  const onSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (hasChanges) {
      if (!Object.values(errors).some(Boolean) && user) {
        setLoading(true);
        userBookRef(user.uid, bid).update({
          'readingState.state_num': state_num,
          'readingState.start_num': start_num,
          'readingState.end_num': end_num,
          'readingState.progress_num': progress_num
        }).then((): void => {
          // console.log(`UserBook readingState updated`);
          if (is.current) onToggle();
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        }).finally((): void => {
          if (is.current) setLoading(false);
        });
      }
    } else onToggle();
  };

  const onNext = (): void => setProgress_num(progress_num + (100/steps));

  const onPrev = (): void => setProgress_num(progress_num - (100/steps));

  const isSaveDisabled = useMemo((): boolean => loading || Object.values(errors).some(Boolean), [errors, loading]);

  return (
    <Fragment>
      <Overlay onClick={onToggle} />
      <div role='dialog' aria-describedby='reading state' className='dialog light reading-state' ref={is}>
        {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
        <div className='content'>
          <div className='row'>
            <div className='form-group col'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel htmlFor='state_num'>Stato lettura</InputLabel>
                <Select
                  id='state_num'
                  name='state_num'
                  value={state_num}
                  onChange={onChangeSelect}>
                  {readingStates.map((item, i) => <MenuItem key={i + 1} value={i + 1}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
          {(state_num === 2 || state_num === 3) && (
            <Fragment>
              <div className='row'>
                <div className={classnames('form-group', `col-${state_num === 3 ? '6' : '12'}`)}>
                  <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale='it'>
                    <DatePicker 
                      // autoOk
                      cancelText='Annulla'
                      className='date-picker'
                      disableFuture
                      leftArrowIcon={icon.chevronLeft}
                      inputFormat='DD/MM/YYYY'
                      // invalidDateMessage='Data non valida'
                      label='Data di inizio'
                      maxDate={max.start_num}
                      minDate={min.start_num}
                      onChange={onChangeDate('start_num')}
                      onError={reason => reason && onSetDatePickerError('start_num', reason)}
                      rightArrowIcon={icon.chevronRight}
                      showTodayButton
                      todayText='Oggi'
                      value={start_num ? new Date(start_num) : null}
                      renderInput={props => (
                        <TextField {...props} margin='normal' fullWidth helperText={errors.start_num} />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                {state_num === 3 && (
                  <div className='form-group col-6'>
                    <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale='it'>
                      <DatePicker 
                        // autoOk
                        className='date-picker'
                        cancelText='Annulla'
                        disabled={state_num !== 3}
                        disableFuture
                        inputFormat='DD/MM/YYYY'
                        // invalidDateMessage='Data non valida'
                        label='Data di fine'
                        leftArrowIcon={icon.chevronLeft}
                        // maxDateMessage='Data futura non valida'
                        minDate={new Date(start_num || min.start_num as number)}
                        // minDateMessage={`Data minima ${new Date(start_num || min.start_num).toLocaleDateString()}`}
                        // name='end_num'
                        onChange={onChangeDate('end_num')}
                        onError={reason => reason && onSetDatePickerError('end_num', reason)}
                        rightArrowIcon={icon.chevronRight}
                        showTodayButton
                        todayText='Oggi'
                        value={end_num ? new Date(end_num) : null}
                        renderInput={props => (
                          <TextField {...props} margin='normal' fullWidth helperText={errors.end_num} />
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
                  className='form-control' 
                />
              )}
            </Fragment>
          )}
        </div>
        <div className='footer no-gutter'>
          <button
            type='button'
            className='btn btn-footer primary'
            onClick={onSubmit}
            disabled={isSaveDisabled}>
            Salva le modifiche
          </button>
        </div>
      </div>
    </Fragment>
  );
};
 
export default ReadingStateForm;