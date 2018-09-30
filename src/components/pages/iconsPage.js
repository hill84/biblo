import React from 'react';
import { icon } from '../../config/icons';
import { funcType } from '../../config/types';

const copy = (text, props) => navigator.clipboard.writeText(text).then(() => {
  props.openSnackbar('Copiato negli appunti', 'success');
}, error => {
  props.openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const IconsPage = props => (
  <div className="container" id="iconsPageComponent">
    <div className="card dark">
      <h2>Icone di sistema</h2>
      <div className="row">
        { Object.keys(icon).map((item, i) => 
          <div className="col tt" onClick={() => copy(item, props)} key={i}>
            <span className="tip">{item}</span>
            <button className="btn lg centered icon flat">
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