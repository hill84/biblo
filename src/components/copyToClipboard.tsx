import Tooltip from '@material-ui/core/Tooltip';
import type { FC, ReactNode } from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation(['common']);

  const onCopy = (): void => {
    if (typeof window !== 'undefined' && text) {
      navigator.clipboard.writeText(String(text)).then((): void => {
        openSnackbar(t('SUCCESS_COPIED'), 'success');
      }, (err: Error): void => {
        openSnackbar(err, 'error');
        console.warn('Async: Could not copy text: ', err);
      });
    }
  };

  return (
    <Tooltip title={t('ACTION_COPY')}>
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