import React from 'react';
import PropTypes from 'prop-types';
import SharedSnackbar from '../components/sharedSnackbar';

const SharedSnackbarContext = React.createContext();

export class SharedSnackbarProvider extends React.Component {
  state = {
    action: null,
    autoHideDuration: 5000,
    isOpen: false,
    message: '',
    variant: null
  }

  static propTypes = {
    children: PropTypes.element.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  openSnackbar = (message, variant, autoHideDuration, action) => {
    if (this._isMounted) {
      this.setState({ action, message, isOpen: true, variant, autoHideDuration });
    }
  }

  closeSnackbar = () => {
    if (this._isMounted) {
      this.setState({ isOpen: false, autoHideDuration: 5000 });
    }
  }

  render() {
    const { action, autoHideDuration, isOpen, message, variant } = this.state;
    const { children } = this.props;

    return (
      <SharedSnackbarContext.Provider
        value={{
          openSnackbar: this.openSnackbar,
          closeSnackbar: this.closeSnackbar,
          snackbarIsOpen: isOpen,
          action,
          message,
          variant,
          autoHideDuration
        }}>
        <SharedSnackbar />
        {children}
      </SharedSnackbarContext.Provider>
    );
  }
}

export const SharedSnackbarConsumer = SharedSnackbarContext.Consumer;