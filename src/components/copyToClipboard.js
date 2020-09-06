import Tooltip from '@material-ui/core/Tooltip';
import React, { useContext } from 'react';
import { elementType, numberType, oneOfType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';

const CopyToClipboard = ({ icon, text }) => {
  const { openSnackbar } = useContext(SnackbarContext);

  const onCopy = () => {
    typeof window !== "undefined" && navigator.clipboard.writeText(text).then(() => {
      openSnackbar('Copiato negli appunti', 'success');
    }, error => {
      openSnackbar('Errore interno', 'error');
      console.warn('Async: Could not copy text: ', error);
    });
  };

  return (
    <Tooltip title="Copia">
      <span
        role="button"
        tabIndex={0}
        className={icon ? 'btn flat rounded icon counter' : 'copy'}
        onClick={onCopy}
        onKeyDown={onCopy}>
        {icon || text}
      </span>
    </Tooltip>
  );
};

CopyToClipboard.propTypes = {
  icon: elementType,
  text: oneOfType([stringType, numberType])
}

CopyToClipboard.defaultProps = {
  icon: null,
  text: null
}

export default CopyToClipboard;