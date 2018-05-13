import React from 'react';
import { icon } from '../config/icons';
import { funcType, stringType } from '../config/types';

export default class Incipit extends React.Component {
	state = {
    isBig: false,
    isDark: false
  }

  static propTypes = {
    title: stringType.isRequired,
    incipit: stringType.isRequired,
    onToggle: funcType.isRequired
  }

  onToggle = () => this.props.onToggle();

  onToggleDarkTheme = () => {
    this.setState(prevState => ({ isDark: !prevState.isDark })); 
  }

  onToggleSize = () => {
    this.setState(prevState => ({ isBig: !prevState.isBig })); 
  }

  render() {
    const { isBig, isDark } = this.state;
    const { incipit, title } = this.props;

		return (
      <React.Fragment>
        <div role="dialog" aria-describedby="incipit" className={`dialog book-incipit ${isDark ? 'dark' : 'light'}`}>
          <div className="absolute-content">
            <div role="navigation" className="head nav row">
              <strong className="col title">{title}</strong>
              <div className="col-auto btn-row">
                <button className="btn icon clear" onClick={this.onToggleSize} title="Formato">{icon.formatSize()}</button> 
                <button className="btn icon clear" onClick={this.onToggleDarkTheme} title="Tema">{icon.lightbulb()}</button> 
                <button className="btn icon clear" onClick={this.onToggle} title="Chiudi">{icon.close()}</button>
              </div>
            </div>
            <p id="incipit" className={isBig ? 'big' : 'regular'}>{incipit}</p>
          </div>
        </div>
        <div className="overlay" onClick={this.onToggle}></div>
      </React.Fragment>
		);
	}
}