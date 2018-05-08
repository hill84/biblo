import React from 'react';
import { copyToClipboard } from '../config/shared';
import { numberType, _oneOfType, stringType } from '../config/types';

const CopyToClipboard = props => (
  <span className="copy tt" onClick={() => copyToClipboard(props.text)}>
    {props.text}
    <span className="tip">Copia</span>
  </span>
);

CopyToClipboard.propTypes = {
  text: _oneOfType([stringType, numberType])
}

export default CopyToClipboard;