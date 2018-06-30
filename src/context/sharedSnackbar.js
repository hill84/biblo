import React from 'react';
import SharedSnackbar from '../components/sharedSnackbar';

const SharedSnackbarContext = React.createContext();

export class SharedSnackbarProvider extends React.Component {
  state = {
    isOpen: false,
    message: '',
    variant: null
  };

  openSnackbar = (message, variant) => {
    this.setState({ message, isOpen: true, variant });
  };

  closeSnackbar = () => {
    this.setState({ message: '', isOpen: false });
  };

  render() {
    const { isOpen, message, variant } = this.state;
    const { children } = this.props;

    return (
      <SharedSnackbarContext.Provider
        value={{
          openSnackbar: this.openSnackbar,
          closeSnackbar: this.closeSnackbar,
          snackbarIsOpen: isOpen,
          message,
          variant
        }}>
        <SharedSnackbar />
        {children}
      </SharedSnackbarContext.Provider>
    );
  }
}

export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer;