import amber from '@material-ui/core/colors/amber';
import blueGrey from '@material-ui/core/colors/blueGrey';
import cyan from '@material-ui/core/colors/cyan';
import { createMuiTheme, Theme } from '@material-ui/core/styles';

export const defaultTheme: Theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      light: cyan[500],
      main: cyan[700],
      dark: cyan[700],
      contrastText: '#FFF',
    },
    secondary: {
      light: amber[300],
      main: amber[400],
      dark: amber[400],
      contrastText: '#FFF',
    },
    background: {
      paper: '#FFF',
      default: blueGrey[900]
    },
    action: {
      hover: 'rgba(0, 151, 167, 0.07)',
      selected: 'rgba(0, 151, 167, 0.1)',
    }
  }
});

export const darkTheme: Theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: cyan[500],
      main: cyan[700],
      dark: cyan[900],
      contrastText: '#FFF',
    },
    secondary: {
      light: amber[300],
      main: amber[400],
      dark: amber[500],
      contrastText: '#FFF',
    },
    background: {
      paper: blueGrey[900],
      default: blueGrey[900]
    }
  }
});

export const primaryTheme: Theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      light: 'rgba(255,255,255,.5)',
      main: 'rgba(255,255,255,.7)',
      dark: '#FFF',
      contrastText: '#FFF',
    },
    secondary: {
      light: 'rgba(255,255,255,.5)',
      main: 'rgba(255,255,255,.7)',
      dark: '#FFF',
      contrastText: '#FFF',
    },
    background: {
      paper: blueGrey[900],
      default: blueGrey[900]
    }
  }
});