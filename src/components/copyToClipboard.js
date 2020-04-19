import Tooltip from '@material-ui/core/Tooltip';
import React, { useContext } from 'react';
import { numberType, oneOfType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';

const copy = (text, openSnackbar) => typeof window !== "undefined" && navigator.clipboard.writeText(text).then(() => {
  // console.log('Async: Copying to clipboard was successful!');
  openSnackbar('Copiato negli appunti', 'success');
}, error => {
  openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const CopyToClipboard = props => {
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <Tooltip title="Copia">
      <span role="button" tabIndex={0} className="copy" onClick={() => copy(props.text, openSnackbar)} onKeyDown={() => copy(props.text, openSnackbar)}>
        {props.text}
      </span>
    </Tooltip>
  );
};

CopyToClipboard.propTypes = {
  text: oneOfType([stringType, numberType])
}

CopyToClipboard.defaultProps = {
  text: null
}

export default CopyToClipboard;