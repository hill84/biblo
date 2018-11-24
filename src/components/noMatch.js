import React from 'react';
import { stringType, shapeType, funcType } from '../config/types';

export default class NoMatch extends React.Component {
  static propTypes = {
    history: shapeType({
      goBack: funcType.isRequired
    }).isRequired,
    imgUrl: stringType,
    location: shapeType({
      pathname: stringType
    }),
    title: stringType,
  }

  goBack = () => this.props.history.goBack();

  render() {
    const { imgUrl, location, title } = this.props;

    return (
      <div className="container empty" id="noMatchComponent">
        <div className="card dark empty">
          <div className="text-center">
            <h1>{title || 'Pagina non trovata'}</h1>
            <p>Controlla di aver digitato correttamente l'indirizzo{location && <span className="hide-sm">: <big><code>{location.pathname}</code></big></span>}.</p>
            {imgUrl && <img src={imgUrl} alt="Pagina non trovata" />}
            <button type="button" onClick={this.goBack} className="btn flat">Torna indietro</button>
          </div>
        </div>
      </div>
    );
  }
}