import React, { PureComponent } from 'react';
import icon from '../config/icons';
import { childrenType } from '../config/proptypes';

const detailsStyle = { whiteSpace: 'pre-wrap', };

export default class ErrorBoundary extends PureComponent {
  state = { 
    error: null, 
    errorInfo: null 
  };
  
  static propTypes = {
    children: childrenType
  };

  static defaultProps = {
    children: null
  };

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    // You can also log error messages to an error reporting service here
  }
  
  render() {
    const { error, errorInfo } = this.state;

    if (errorInfo) {
      return (
        <div className="container empty">
          <div className="card dark empty shake reveal">
            <div className="text-center">
              <div className="circle-icon popIn reveal">{icon.alert}</div>
              <h1>Qualcosa &egrave; andato storto</h1>
              <p>Tranquillə, non &egrave; colpa tua... <a href="/">Torna alla home</a> per proseguire.<br />
              Se hai bisogno di aiuto scrivi a <a href="mailto:info@biblo.space">info@biblo.space</a>.</p>
              <details style={detailsStyle}>
                <summary className="btn flat rounded">Dettagli</summary>
                {error && <h2>{error.toString}</h2>}
                <div className="dark card details-code">{errorInfo.componentStack}</div>
              </details>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }  
}