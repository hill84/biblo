import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Close } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import '../css/snackbar.css';

const initialAutoHideDuration = 5000;

const SnackbarContext = createContext(null);

export default SnackbarContext;

export const SnackbarProvider = props => {
  const { children } = props;
  const [action, setAction] = useState(null);
  const [autoHideDuration, setAutoHideDuration] = useState(initialAutoHideDuration);
  const [snackbarIsOpen, setSnackbarIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(null);
  const is = useRef(true);
  
  useEffect(() => () => {
    is.current = false;
  }, []);

  const openSnackbar = useCallback((message, variant, autoHideDuration, action) => {
    if (is.current) {
      setAction(action);
      setMessage(message);
      setSnackbarIsOpen(true);
      setVariant(variant);
      setAutoHideDuration(autoHideDuration);
    }
  }, []);

  const closeSnackbar = useCallback(() => {
    if (is.current) {
      setSnackbarIsOpen(false);
      setAutoHideDuration(initialAutoHideDuration);
    }
  }, []);

  const snackbarProvided = useMemo(() => ({ 
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
    <SnackbarContext.Provider
      value={snackbarProvided}>
      <SharedSnackbar />
      {children}
    </SnackbarContext.Provider>
  );
}

SnackbarProvider.propTypes = {
  children: PropTypes.element.isRequired
}

const SharedSnackbar = () => {
  const {
    action,
    autoHideDuration,
    closeSnackbar,
    message,
    snackbarIsOpen,
    variant
  } = useContext(SnackbarContext);

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={snackbarIsOpen}
      autoHideDuration={autoHideDuration || initialAutoHideDuration}
      onClose={closeSnackbar}>
      <SnackbarContent
        message={message}
        className={`snackbar-content ${variant}`}
        action={action || [
          <IconButton key="close" color="inherit" onClick={closeSnackbar}>
            <Close />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};