import React from 'react';
import { numberType, _oneOfType, stringType, funcType } from '../config/types';

const copy = (text, props) => navigator.clipboard.writeText(text).then(() => {
  // console.log('Async: Copying to clipboard was successful!');
  props.openSnackbar('Copiato negli appunti', 'success');
}, error => {
  props.openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const CopyToClipboard = props => (
  <span className="copy tt" onClick={() => copy(props.text, props)}>
    {props.text}
    <span className="tip">Copia</span>
  </span>
);

CopyToClipboard.propTypes = {
  text: _oneOfType([stringType, numberType]),
  openSnackbar: funcType.isRequired
}

export default CopyToClipboard;