import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import React from 'react';
/* import { icon } from '../config/icons';
import { shapeType, stringType } from '../config/types'; */

export default class readingState extends React.Component {
	state = {
    value: null
  }

  onToggle = () => this.props.onToggle();

  handleChange = (event, index, value) => this.setState({value});

  render() {
		return (
      <React.Fragment>
        <div role="dialog" aria-describedby="reading state" className="dialog light reading-state">
          <div className="content">
            <SelectField
              floatingLabelText="Stato lettura"
              value={this.state.value}
              onChange={this.handleChange}
            >
              <MenuItem value={1} primaryText="Non iniziato" />
              <MenuItem value={2} primaryText="In lettura" />
              <MenuItem value={3} primaryText="Finito" />
              <MenuItem value={4} primaryText="Abbandonato" />
              <MenuItem value={5} primaryText="Da consultazione" />
            </SelectField>
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