import React from 'react';
import { Helmet } from 'react-helmet';
import { icon } from '../../config/icons';
import { app } from '../../config/shared';
import { funcType } from '../../config/types';

const copy = (text, props) => navigator.clipboard.writeText(text).then(() => {
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
    <div className="card dark">
      <h2>Icone di sistema</h2>
      <div className="row">
        { Object.keys(icon).map((item, i) => 
          <div className="col tt" onClick={() => copy(item, props)} key={i}>
            <span className="tip">{item}</span>
            <button type="button" className="btn lg centered icon flat">
              {icon[item]()}
            </button>
          </div>
        )}
      </div>
    </div>   
  </div>
);

IconsPage.propTypes = {
  openSnackbar: funcType.isRequired
}

export default IconsPage;