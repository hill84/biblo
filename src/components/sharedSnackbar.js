import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import { Close } from '@material-ui/icons';
import React from 'react';
import { SharedSnackbarConsumer } from '../context/snackbarContext';

const SharedSnackbar = () => (
  <SharedSnackbarConsumer>
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
  </SharedSnackbarConsumer>
);

export default SharedSnackbar;