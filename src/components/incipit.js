import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from 'react';
import { SayButton } from 'react-say';
import icon from '../config/icons';
import { funcType, stringType } from '../config/types';
import Overlay from './overlay';

export default class Incipit extends Component {
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

  static defaultProps = {
    copyrightHolder: null,
    publication: null
  }

  onToggle = () => this.props.onToggle();

  onToggleDarkTheme = () => this.setState(prevState => ({ isDark: !prevState.isDark }));

  onToggleSize = () => this.setState(prevState => ({ isBig: !prevState.isBig }));

  render() {
    const { isBig, isDark } = this.state;
    const { copyrightHolder, incipit, publication, title } = this.props;

		return (
      <>
        <div role="dialog" aria-describedby="incipit" className={`dialog book-incipit ${isDark ? 'dark' : 'light'}`}>
          <div className="absolute-content">
            <div role="navigation" className="head nav row">
              <strong className="col title">{title}</strong>
              <div className="col-auto btn-row">
                <SayButton speak={incipit}>
                  <Tooltip title="Ascolta" placement="bottom">
                    <div className="btn rounded icon flat audio">
                      {icon.voice()}
                    </div>
                  </Tooltip>
                </SayButton>
                <Tooltip title="Formato" placement="bottom">
                  <button type="button" className="btn rounded icon flat" onClick={this.onToggleSize}>{icon.formatSize()}</button> 
                </Tooltip>
                <Tooltip title="Tema" placement="bottom">
                  <button type="button" className="btn rounded icon flat" onClick={this.onToggleDarkTheme}>{icon.lamp()}</button> 
                </Tooltip>
                <Tooltip title="Chiudi" placement="bottom">
                  <button type="button" className="btn rounded icon flat" onClick={this.onToggle}>{icon.close()}</button>
                </Tooltip>
              </div>
            </div>
            <p className={`incipit ${isBig ? 'big' : 'regular'}`}>{incipit}</p>
            {copyrightHolder && <p className="copyright">&copy; {publication && new Date(publication).getFullYear()} {copyrightHolder}</p>}
          </div>
        </div>
        <Overlay onClick={this.onToggle} />
      </>
		);
	}
}