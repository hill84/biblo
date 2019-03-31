import React from 'react';
import { icon } from '../config/icons';
import { funcType, stringType } from '../config/types';

export default class Incipit extends React.Component {
	state = {
    isBig: false,
    isDark: false
  }

  static propTypes = {
    copyrightHolder: stringType,
    incipit: stringType.isRequired,
    onToggle: funcType.isRequired,
    publication: stringType,
    title: stringType.isRequired
  }

  onToggle = () => this.props.onToggle();

  onToggleDarkTheme = () => this.setState(prevState => ({ isDark: !prevState.isDark }));

  onToggleSize = () => this.setState(prevState => ({ isBig: !prevState.isBig }));

  render() {
    const { isBig, isDark } = this.state;
    const { copyrightHolder, incipit, publication, title } = this.props;

		return (
      <React.Fragment>
        <div role="dialog" aria-describedby="incipit" className={`dialog book-incipit ${isDark ? 'dark' : 'light'}`}>
          <div className="absolute-content">
            <div role="navigation" className="head nav row">
              <strong className="col title">{title}</strong>
              <div className="col-auto btn-row">
                <button type="button" className="btn rounded icon flat" onClick={this.onToggleSize} title="Formato">{icon.formatSize()}</button> 
                <button type="button" className="btn rounded icon flat" onClick={this.onToggleDarkTheme} title="Tema">{icon.lamp()}</button> 
                <button type="button" className="btn rounded icon flat" onClick={this.onToggle} title="Chiudi">{icon.close()}</button>
              </div>
            </div>
            <p className={`incipit ${isBig ? 'big' : 'regular'}`}>{incipit}</p>
            {copyrightHolder && <p className="copyright">&copy; {publication && new Date(publication).getFullYear()} {copyrightHolder}</p>}
          </div>
        </div>
        <div className="overlay" onClick={this.onToggle} />
      </React.Fragment>
		);
	}
}