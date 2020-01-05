import React from 'react';
import { Helmet } from 'react-helmet-async';
import icon from '../../config/icons';
import { app } from '../../config/shared';

const copy = (text, props) => typeof window !== "undefined" && navigator.clipboard.writeText(text).then(() => {
  props.openSnackbar('Copiato negli appunti', 'success');
}, error => {
  props.openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const IconsPage = props => (
  <div className="container" id="iconsPageComponent">
    <Helmet>
      <title>{app.name} | Icone</title>
    </Helmet>
    <h2>Icone di sistema</h2>
    <div className="card dark">
      <div className="row">
        {Object.keys(icon).map((item, i) => 
          <div role="button" tabIndex={0} className="col tt" onClick={() => copy(item, props)} onKeyDown={() => copy(item, props)} key={i}>
            <span className="tip">{item}</span>
            <button type="button" className="btn lg centered icon flat">
              {icon[item]}
            </button>
          </div>
        )}
      </div>
    </div>   
  </div>
);

export default IconsPage;