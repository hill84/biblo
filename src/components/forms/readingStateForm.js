import DatePicker from 'material-ui/DatePicker';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import React from 'react';
import { uid, userBookRef } from '../../config/firebase';
import { DateTimeFormat } from '../../config/locales';
import { funcType, numberType, shapeType, stringType } from '../../config/types';
// import { icon } from '../../config/icons';

export default class readingStateForm extends React.Component {
	state = {
    state_num: this.props.readingState.state_num || 1,
    start_num: this.props.readingState.start_num || null,
    end_num: this.props.readingState.end_num || null,
    changes: false,
    errors: {}
  }

  static propTypes = {
    bid: stringType.isRequired,
    onToggle: funcType.isRequired,
    readingState: shapeType({
      state_num: numberType.isRequired,
      start_num: numberType,
      end_num: numberType,
    }).isRequired
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.readingState.state_num !== prevState.state_num) { return { state_num: nextProps.readingState.state_num }}
    if (nextProps.readingState.start_num !== prevState.start_num) { return { start_num: nextProps.readingState.start_num }}
    if (nextProps.readingState.end_num !== prevState.end_num) { return { end_num: nextProps.readingState.end_num }}
    return null;
  }

  onToggle = () => this.props.onToggle();

  onChange = (event, index, value) => {
    this.setState({ state_num: value });
    if (value !== 2 || value !== 3) {
      this.setState({ start_num: null });
    }
    if (value !== 3) {
      this.setState({ end_num: null });
    }
  }

  onChangeDate = key => (event, date) => {
		this.setState({ 
      [key]: Number(date.getTime()), 
      changes: true,
      errors: { 
        ...this.state.errors, 
        [key]: null 
      }
    });
  };

  validate = (start, end) => {
    const errors = {};
    const today = Number(new Date().getTime());
    if (start > today) {
      errors.start_num = "Data non valida";
    }
    if (end > today) {
      errors.end_num = "Data non valida";
    }
    if (!!end && start > end) {
      errors.end_num = "Data non valida";
    }
    return errors;
  }

  onSubmit = e => {
    e.preventDefault();
    const { state_num } = this.state;
    const errors = this.validate(this.state.start_num, this.state.end_num);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      userBookRef(uid, this.props.bid).update({
        'readingState.state_num': state_num,
        'readingState.start_num': this.state.start_num || null,
        'readingState.end_num': this.state.end_num || null
      }).then(() => {
        console.log(`UserBook readingState updated`);
      }).catch(error => console.warn(error));
      this.props.onToggle();
    }
  }

  render() {
    const { end_num, errors, start_num, state_num } = this.state;

		return (
      <React.Fragment>
        <div role="dialog" aria-describedby="reading state" className="dialog light reading-state">
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <SelectField
                  floatingLabelText="Stato lettura"
                  value={state_num}
                  onChange={this.onChange}
                  fullWidth={true}
                >
                  <MenuItem value={1} primaryText="Non iniziato" />
                  <MenuItem value={2} primaryText="In lettura" />
                  <MenuItem value={3} primaryText="Finito" />
                  <MenuItem value={4} primaryText="Abbandonato" />
                  <MenuItem value={5} primaryText="Da consultazione" />
                </SelectField>
              </div>
            </div>
            {(state_num === 2 || state_num === 3) &&
              <div className="row">
                <div className="form-group col-6">
                  <DatePicker 
                    name="start_num"
                    cancelLabel="Annulla"
                    DateTimeFormat={DateTimeFormat}
                    locale="it"
                    errorText={errors.start_num}
                    floatingLabelText="Data di inizio"
                    value={start_num ? new Date(start_num) : null}
                    onChange={this.onChangeDate("start_num")}
                    fullWidth={true}
                  />
                </div>
                <div className="form-group col-6">
                  <DatePicker 
                    name="end_num"
                    cancelLabel="Annulla"
                    DateTimeFormat={DateTimeFormat}
                    locale="it"
                    errorText={errors.end_num}
                    floatingLabelText="Data di fine"
                    value={end_num ? new Date(end_num) : null}
                    onChange={this.onChangeDate("end_num")}
                    fullWidth={true}
                    disabled={state_num !== 3}
                  />
                </div>
              </div>
            }
          </div>
          <div className="footer no-gutter">
            <button className="btn btn-footer primary" onClick={this.onSubmit}>Salva le modifiche</button>
          </div>
        </div>
        <div className="overlay" onClick={this.onToggle}></div>
      </React.Fragment>
		);
	}
}