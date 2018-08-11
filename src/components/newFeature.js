import React from 'react';

export default class NewFeature extends React.Component {
  render() {
    return (
      <div className="container empty">
        <div className="text-center">
          <h1>Questa funzionalità non è ancora stata sviluppata</h1>
          <p>Ti piacerebbe vederla realizzata? Che ne dici di una piccola donazione?</p>
          <button className="btn primary">Fai una donazione</button>
        </div>
      </div>
    );
  }
}