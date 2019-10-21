import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';
import { /* funcType, */ numberType, stringType, _oneOfType } from '../config/types';

const copy = (text, props) => typeof window !== "undefined" && navigator.clipboard.writeText(text).then(() => {
  // console.log('Async: Copying to clipboard was successful!');
  props.openSnackbar('Copiato negli appunti', 'success');
}, error => {
  props.openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const CopyToClipboard = React.forwardRef((props, ref) => (
  <Tooltip title="Copia">
    <span role="button" tabIndex={0} className="copy" onClick={() => copy(props.text, props)} onKeyDown={() => copy(props.text, props)} ref={ref}>
      {props.text}
    </span>
  </Tooltip>
));

CopyToClipboard.propTypes = {
  text: _oneOfType([stringType, numberType]),
  // openSnackbar: funcType.isRequired
}

CopyToClipboard.defaultProps = {
  text: null
}

export default CopyToClipboard;