import React from 'react';
import { objectType } from '../config/types';

export default class NoMatch extends React.Component {
  static contextTypes = {
    router: () => true // replace with PropTypes.object if you use them
  }

  render(props) {
    const { imgUrl, location, title } = this.props;

    return (
      <div className="container empty" id="noMatchComponent">
        <div className="card dark empty">
          <div className="text-align-center">
            <h1>{title || 'Pagina non trovata'}</h1>
            <p>Controlla di aver digitato correttamente l'indirizzo{location && <span>: <big><code>{location.pathname}</code></big></span>}.</p>
            {imgUrl && <img src={imgUrl} alt="Pagina non trovata" />}
            <button onClick={this.context.router.history.goBack} className="btn flat">Torna indietro</button>
          </div>
        </div>
      </div>
    );
  }
}

NoMatch.propTypes = {
  router: objectType.isRequired
}