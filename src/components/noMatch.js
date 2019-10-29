import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { app } from '../config/shared';
import { funcType, locationType, shapeType, stringType } from '../config/types';
import RandomQuote from './randomQuote';

export default class NoMatch extends Component {
  static propTypes = {
    history: shapeType({
      goBack: funcType.isRequired
    }).isRequired,
    imgUrl: stringType,
    location: locationType,
    title: stringType,
  }

  static defaultProps = {
    imgUrl: null,
    location: null,
    title: null
  }

  goBack = () => this.props.history.goBack();

  render() {
    const { imgUrl, location, title } = this.props;

    return (
      <div className="container empty" id="noMatchComponent">
        <Helmet>
          <title>{app.name} | {title || 'Pagina non trovata'}</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="card dark empty">
          <div className="text-center">
            <h1>{title || 'Pagina non trovata'}</h1>
            <p>Controlla di aver digitato correttamente l&apos;indirizzo{location && <span className="hide-sm">: <big><code className="primary-text">{location.pathname}</code></big></span>}.</p>
            {imgUrl && <img src={imgUrl} alt="Pagina non trovata" />}
            <button type="button" onClick={this.goBack} className="btn flat rounded">Torna indietro</button>
          </div>
        </div>

        <div className="card flat col-md-8">
          <RandomQuote className="quote-container" skeleton={false} />
        </div>
      </div>
    );
  }
}