import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Close } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import '../css/snackbar.css';

const SnackbarContext = createContext();

const initialAutoHideDuration = 5000;

export const SnackbarProvider = props => {
  const { children } = props;
  const [action, setAction] = useState(null);
  const [autoHideDuration, setAutoHideDuration] = useState(initialAutoHideDuration);
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(true);
      setVariant(variant);
      setAutoHideDuration(autoHideDuration);
    }
  }, []);

  const closeSnackbar = useCallback(() => {
    if (is.current) {
      setIsOpen(false);
      setAutoHideDuration(initialAutoHideDuration);
    }
  }, []);

  return (
    <SnackbarContext.Provider
      value={{
        openSnackbar,
        closeSnackbar,
        snackbarIsOpen: isOpen,
        action,
        message,
        variant,
        autoHideDuration
      }}>
      <SharedSnackbar />
      {children}
    </SnackbarContext.Provider>
  );
}

SnackbarProvider.propTypes = {
  children: PropTypes.element.isRequired
}

export const SnackbarConsumer = SnackbarContext.Consumer;

const SharedSnackbar = () => (
  <SnackbarConsumer>
    {({ action, autoHideDuration, closeSnackbar, message, snackbarIsOpen, variant }) => (
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
    )}
  </SnackbarConsumer>
);