import Tooltip from '@material-ui/core/Tooltip';
import React, { FC, ReactNode, useContext } from 'react';
import SnackbarContext from '../context/snackbarContext';

interface CopyToClipboardProps {
  icon?: ReactNode;
  text?: string | number;
}

const CopyToClipboard: FC<CopyToClipboardProps> = ({
  icon,
  text
}: CopyToClipboardProps) => {
  const { openSnackbar } = useContext(SnackbarContext);

  const onCopy = (): void => {
    if (typeof window !== 'undefined' && text) {
      navigator.clipboard.writeText(String(text)).then((): void => {
        openSnackbar('Copiato negli appunti', 'success');
      }, (err: Error): void => {
        openSnackbar('Errore interno', 'error');
        console.warn('Async: Could not copy text: ', err);
      });
    }
  };

  return (
    <Tooltip title='Copia'>
      <span
        role='button'
        tabIndex={0}
        className={icon ? 'btn flat rounded icon counter' : 'copy'}
        onClick={onCopy}
        onKeyDown={onCopy}>
        {icon || text}
      </span>
    </Tooltip>
  );
};

export default CopyToClipboard;