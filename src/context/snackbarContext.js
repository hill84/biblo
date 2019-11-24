import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Close } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React, { createContext, useEffect, useRef, useState } from 'react';
import '../css/snackbar.css';

const SnackbarContext = createContext();

export const SnackbarProvider = props => {
  const is = useRef(true);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const [state, setState] = useState({
    action: null,
    autoHideDuration: 5000,
    isOpen: false,
    message: '',
    variant: null
  });

  const openSnackbar = (message, variant, autoHideDuration, action) => {
    if (is.current) {
      setState(prevState => ({ ...prevState, action, message, isOpen: true, variant, autoHideDuration }));
    }
  }

  const closeSnackbar = () => {
    if (is.current) {
      setState(prevState => ({ ...prevState, isOpen: false, autoHideDuration: 5000 }));
    }
  }

  const { action, autoHideDuration, isOpen, message, variant } = state;
  const { children } = props;

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
        autoHideDuration={autoHideDuration || 5000}
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