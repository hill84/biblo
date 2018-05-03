import DatePicker from 'material-ui/DatePicker';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import React from 'react';
/* import { icon } from '../config/icons';
import { shapeType, stringType } from '../config/types'; */

export default class readingStateForm extends React.Component {
	state = {
    value: null,
    start: null,
    end: null,
    changes: false,
    errors: {}
  }

  onToggle = () => this.props.onToggle();

  onChange = (event, index, value) => this.setState({value});

  onChangeDate = key => (event, date) => {
		this.setState({ 
      [key]: String(date), 
      changes: true
    });
  };

  render() {
    const { end, errors, value, start } = this.state;

		return (
      <React.Fragment>
        <div role="dialog" aria-describedby="reading state" className="dialog light reading-state">
          <div className="content">
            <div className="row">
              <div className="form-group">
                <SelectField
                  floatingLabelText="Stato lettura"
                  value={value}
                  onChange={this.onChange}
                >
                  <MenuItem value={1} primaryText="Non iniziato" />
                  <MenuItem value={2} primaryText="In lettura" />
                  <MenuItem value={3} primaryText="Finito" />
                  <MenuItem value={4} primaryText="Abbandonato" />
                  <MenuItem value={5} primaryText="Da consultazione" />
                </SelectField>
              </div>
            </div>
            <div className="row">
              {(value === 2 || value === 3) &&
                <div className="form-group col-6">
                  <DatePicker 
                    name="start"
                    hintText="2013-05-01" 
                    cancelLabel="Annulla"
                    openToYearSelection={true} 
                    errorText={errors.start}
                    floatingLabelText="Data di inizio"
                    value={start ? new Date(start) : null}
                    onChange={this.onChangeDate("start")}
                    fullWidth={true}
                  />
                </div>
              }

              {(value === 3) &&
                <div className="form-group col-6">
                  <DatePicker 
                    name="end"
                    hintText="2013-05-01" 
                    cancelLabel="Annulla"
                    openToYearSelection={true} 
                    errorText={errors.start}
                    floatingLabelText="Data di fine"
                    value={end ? new Date(end) : null}
                    onChange={this.onChangeDate("end")}
                    fullWidth={true}
                  />
                </div>
              }
            </div>
          </div>
          <div className="footer no-gutter">
            <button className="btn btn-footer primary">Salva le modifiche</button>
          </div>
        </div>
        <div className="overlay" onClick={this.onToggle}></div>
      </React.Fragment>
		);
	}
}