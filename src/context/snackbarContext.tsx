import IconButton from '@material-ui/core/IconButton';
import type { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Close } from '@material-ui/icons';
import classnames from 'classnames';
import type { FC, ReactElement, ReactNode, SyntheticEvent } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import '../css/snackbar.css';

const initialAutoHideDuration = 5000;

export type SnackbarVariantType = 'error' | 'info' | 'success' | 'warning';

export type OpenSnackbarType = (message: ReactNode, variant?: SnackbarVariantType, autoHideDuration?: number, action?: ReactElement) => void;

export interface SnackbarContextModel {
  action?: ReactElement;
  autoHideDuration?: number;
  closeSnackbar: (event: SyntheticEvent<unknown, Event>, reason?: SnackbarCloseReason) => void;
  message: ReactNode;
  openSnackbar: OpenSnackbarType;
  snackbarIsOpen?: boolean;
  variant?: SnackbarVariantType;
}

const SnackbarContext = createContext<SnackbarContextModel>({
  autoHideDuration: initialAutoHideDuration,
  closeSnackbar: () => null,
  message: '',
  openSnackbar: () => null,
  snackbarIsOpen: false,
});

export default SnackbarContext;

export const SnackbarProvider: FC = ({ children }) => {
  const [action, setAction] = useState<ReactElement | undefined>(undefined);
  const [autoHideDuration, setAutoHideDuration] = useState<number>(initialAutoHideDuration);
  const [snackbarIsOpen, setSnackbarIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<ReactNode>('');
  const [variant, setVariant] = useState<SnackbarVariantType>('info');

  const openSnackbar = useCallback((message: ReactNode, variant?: SnackbarVariantType, autoHideDuration?: number, action?: ReactElement): void => {
    setAction(action);
    setMessage(message);
    setSnackbarIsOpen(true);
    setVariant(variant || 'info');
    setAutoHideDuration(autoHideDuration || initialAutoHideDuration);
  }, []);

  const closeSnackbar = useCallback((): void => {
    setSnackbarIsOpen(false);
    setAutoHideDuration(initialAutoHideDuration);
  }, []);

  const provided = useMemo((): SnackbarContextModel => ({ 
    action,
    autoHideDuration,
    closeSnackbar,
    message,
    openSnackbar,
    snackbarIsOpen,
    variant
  }), [
    action,
    autoHideDuration,
    closeSnackbar,
    message,
    openSnackbar,
    snackbarIsOpen,
    variant
  ]);

  return (
    <SnackbarContext.Provider value={provided}>
      <SharedSnackbar />
      {children}
    </SnackbarContext.Provider>
  );
};

const SharedSnackbar = () => {
  const {
    action,
    autoHideDuration = initialAutoHideDuration,
    closeSnackbar,
    message,
    snackbarIsOpen,
    variant
  } = useContext<SnackbarContextModel>(SnackbarContext);
  const [paused, setPaused] = useState<boolean>(false);
  const playstate: 'paused' | 'running' = paused ? 'paused' : 'running';

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      open={snackbarIsOpen}
      autoHideDuration={autoHideDuration}
      onClose={closeSnackbar}>
      <SnackbarContent
        message={message}
        className={classnames('snackbar-content', variant)}
        style={{ animationDuration: `${autoHideDuration}ms`, animationPlayState: playstate, }}
        action={action || [
          <IconButton
            key='close'
            color='inherit'
            onClick={closeSnackbar}>
            <Close />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};