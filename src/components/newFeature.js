import React from 'react';

export default class NewFeature extends React.Component {
  render() {
    return (
      <div className="container empty">
        <div className="text-center">
          <h1>Questa funzionalità non è ancora pronta</h1>
          <p>Ti piacerebbe vederla realizzata? Puoi contribuire con una donazione.</p>
          <button className="btn primary">Fai una donazione</button>
        </div>
      </div>
    );
  }
}