import MomentUtils from '@date-io/moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import DatePicker from 'material-ui-pickers/DatePicker';
import MuiPickersUtilsProvider from 'material-ui-pickers/MuiPickersUtilsProvider';
import moment from 'moment';
import 'moment/locale/it';
import React from 'react';
import { authid, userBookRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { funcType, numberType, shapeType, stringType } from '../../config/types';
import Stepper from '../stepper';

export default class readingStateForm extends React.Component {
	state = {
    state_num: this.props.readingState.state_num || 1,
    start_num: this.props.readingState.start_num || null,
    end_num: this.props.readingState.end_num || null,
    changes: false,
    loading: false,
    errors: {},
    prevProps: this.props,
    progress_num: this.props.readingState.progress_num || (this.props.readingState.state_num === 3 ? 100 : 0),
    steps: 4
  }

  static propTypes = {
    bid: stringType.isRequired,
    onToggle: funcType.isRequired,
    readingState: shapeType({
      state_num: numberType.isRequired,
      start_num: numberType,
      end_num: numberType,
      progress_num: numberType
    }).isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (state.prevProps !== props) {
      if (props.readingState.state_num !== state.state_num) { return { prevProps: props, state_num: props.readingState.state_num }}
      if (props.readingState.start_num !== state.start_num) { return { prevProps: props, start_num: props.readingState.start_num }}
      if (props.readingState.end_num !== state.end_num) { return { prevProps: props, end_num: props.readingState.end_num }}
      if (props.readingState.progress_num !== state.progress_num) { return { prevProps: props, progress_num: props.progress_num }}
    }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { progress_num, state_num, steps } = this.state;
    if (this._isMounted) {
      if (state_num !== prevState.state_num) {
        switch (state_num) {
          case 1: this.setState({ progress_num: 0 }); break;
          case 2: this.setState({ progress_num: (100 / steps) }); break;
          case 3: 
          case 4: 
          case 5: this.setState({ progress_num: 100 }); break;
          default: break;
        }
        this.setState({ changes: true });
      }
      if (progress_num !== prevState.progress_num) {
        if (progress_num === 0) this.setState({ state_num: 1 });
        if (progress_num === (100 / steps)) this.setState({ state_num: 2 });
        if (progress_num === 100) this.setState({ state_num: 3 });
        this.setState({ changes: true });
      }
    }
  }

  onToggle = () => this.props.onToggle();

  onChangeSelect = key => e => {
    this.setState({ [key]: e.target.value, changes: true });
	};

  onChangeDate = key => date => {
    // console.log(date);
		this.setState({ 
      [key]: new Date(date).getTime(), 
      changes: true,
      errors: { ...this.state.errors, [key]: null }
    });
  };

  validate = (start, end) => {
    const errors = {};
    const today = new Date().getTime();
    if (start > today) {
      errors.start_num = "Data futura non valida";
    }
    if (end > today) {
      errors.end_num = "Data futura non valida";
    }
    if (end && start > end) {
      errors.end_num = "Data non valida";
    }
    return errors;
  }

  onSubmit = e => {
    e.preventDefault();
    const { changes, state_num } = this.state;
    if (changes) {
      const errors = this.validate(this.state.start_num, this.state.end_num);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        userBookRef(authid, this.props.bid).update({
          'readingState.state_num': state_num,
          'readingState.start_num': this.state.start_num,
          'readingState.end_num': this.state.end_num,
          'readingState.progress_num': this.state.progress_num
        }).then(() => {
          // console.log(`UserBook readingState updated`);
          this.setState({ loading: false });
          this.props.onToggle();
        }).catch(error => console.warn(error));
      }
    } else this.props.onToggle();
  }

  onNext = () => this.setState(state => ({ progress_num: state.progress_num + (100/state.steps) }));

  onPrev = () => this.setState(state => ({ progress_num: state.progress_num - (100/state.steps) }));

  render() {
    const { end_num, loading, progress_num, start_num, state_num, steps } = this.state;

		return (
      <React.Fragment>
        <div className="overlay" onClick={this.onToggle} />
        <div role="dialog" aria-describedby="reading state" className="dialog light reading-state">
          {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel htmlFor="state_num">Stato lettura</InputLabel>
                  <Select
                    id="state_num"
                    value={state_num}
                    onChange={this.onChangeSelect("state_num")}>
                    <MenuItem key="rs1" value={1}>Non iniziato</MenuItem>
                    <MenuItem key="rs2" value={2}>In lettura</MenuItem>
                    <MenuItem key="rs3" value={3}>Finito</MenuItem>
                    <MenuItem key="rs4" value={4}>Abbandonato</MenuItem>
                    <MenuItem key="rs5" value={5}>Da consultazione</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            {(state_num === 2 || state_num === 3) &&
              <React.Fragment>
                <div className="row">
                  <div className={`form-group ${state_num === 3 ? `col-6` : `col-12`}`}>
                    <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="it">
                      <DatePicker 
                        className="date-picker"
                        name="start_num"
                        cancelLabel="Annulla"
                        leftArrowIcon={icon.chevronLeft()}
                        rightArrowIcon={icon.chevronRight()}
                        format="D MMMM YYYY"
                        minDate={new Date().setFullYear(new Date().getFullYear() - 100)}
                        minDateMessage="Praticamente nel Jurassico.."
                        maxDate={state_num === 3 ? end_num ? new Date(end_num) : new Date() : new Date()}
                        maxDateMessage="Data non valida"
                        label="Data di inizio"
                        value={start_num ? new Date(start_num) : null}
                        onChange={this.onChangeDate("start_num")}
                        margin="normal"
                        animateYearScrolling
                        todayLabel="Oggi"
                        showTodayButton
                        fullWidth
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  {state_num === 3 &&
                    <div className="form-group col-6">
                      <MuiPickersUtilsProvider utils={MomentUtils} moment={moment} locale="it">
                        <DatePicker 
                          className="date-picker"
                          name="end_num"
                          cancelLabel="Annulla"
                          leftArrowIcon={icon.chevronLeft()}
                          rightArrowIcon={icon.chevronRight()}
                          format="D MMMM YYYY"
                          minDate={new Date(start_num)}
                          minDateMessage="Data non valida"
                          maxDate={new Date()}
                          maxDateMessage="Data futura non valida"
                          label="Data di fine"
                          value={end_num ? new Date(end_num) : null}
                          onChange={this.onChangeDate("end_num")}
                          margin="normal"
                          animateYearScrolling
                          todayLabel="Oggi"
                          showTodayButton
                          fullWidth
                          disabled={state_num !== 3}
                        />
                      </MuiPickersUtilsProvider>
                    </div>
                  }
                </div>
                {state_num === 2 &&
                  <Stepper 
                    percent={progress_num} 
                    onPrev={this.onPrev} 
                    onNext={this.onNext} 
                    steps={steps}
                    className="form-control" 
                  />
                }
              </React.Fragment>
            }
          </div>
          <div className="footer no-gutter">
            <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Salva le modifiche</button>
          </div>
        </div>
      </React.Fragment>
		);
	}
}