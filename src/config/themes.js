import amber from '@material-ui/core/colors/amber';
import blueGrey from '@material-ui/core/colors/blueGrey';
import cyan from '@material-ui/core/colors/cyan';
import { createMuiTheme } from '@material-ui/core/styles';

export const defaultTheme = createMuiTheme({
  palette: {
    type: "light",
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
    text: {
      // primary: cyan[700],
      // secondary: "rgba(0, 0, 0, 0.3)",
      // disabled: "rgba(0, 0, 0, 0.38)",
      // hint: "rgba(0, 0, 0, 0.38)"
    },
    typography: {
      suppressDeprecationWarnings: true,
      useNextVariants: true
    },
    background: {
      paper: '#FFF',
      default: blueGrey[900]
    },
    action: {
      // active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 151, 167, 0.07)",
      // hoverOpacity: 0.08,
      selected: "rgba(0, 151, 167, 0.1)",
      // disabled: "rgba(0, 0, 0, 0.26)",
      // disabledBackground: "rgba(0, 0, 0, 0.12)"
    }
  }
});

export const darkTheme = createMuiTheme({
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
      paper: '#32434E',
      default: blueGrey[900]
    },
    typography: {
      suppressDeprecationWarnings: true,
      useNextVariants: true
    }
  }
});

export const primaryTheme = createMuiTheme({
  palette: {
    type: "dark",
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
      paper: '#32434E',
      default: blueGrey[900]
    },
    typography: {
      suppressDeprecationWarnings: true,
      useNextVariants: true
    }
  }
});