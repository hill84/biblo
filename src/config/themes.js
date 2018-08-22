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
      //primary: cyan[700],
      //secondary: "rgba(0, 0, 0, 0.3)",
      //disabled: "rgba(0, 0, 0, 0.38)",
      //hint: "rgba(0, 0, 0, 0.38)"
    },
    background: {
      paper: '#FFF',
      default: blueGrey[900]
    },
    action: {
      //active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 151, 167, 0.07)",
      //hoverOpacity: 0.08,
      selected: "rgba(0, 151, 167, 0.1)",
      //disabled: "rgba(0, 0, 0, 0.26)",
      //disabledBackground: "rgba(0, 0, 0, 0.12)"
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
    }
  }
});

/* export const muiTheme = getMuiTheme({
  palette: {
    primary1Color: cyan700,
    primary2Color: cyan900,
    accent1Color: amber400,
    accent2Color: amber500,
    pickerHeaderColor: cyan700
  },
  appBar: { height: 60 },
  drawer: { color: blueGrey900 },
  datePicker: { selectColor: cyan700 },
  menuItem: { hoverColor: 'rgba(0, 151, 167, 0.1)' }
});

export const muiThemeDark = getMuiTheme({
  palette: {
    textColor: '#fff',
    secondaryTextColor: 'rgba(255,255,255,.7)',
    alternateTextColor: '#303030',
    canvasColor: '#303030',
    borderColor: 'rgba(255,255,255,.3)',
    disabledColor: 'rgba(255,255,255,.3)',
    pickerHeaderColor: 'rgba(255,255,255,.12)',
    clockCircleColor: 'rgba(255,255,255,.12)',
  }
});

export const muiThemePrimary = getMuiTheme({
  palette: {
    primary1Color: 'rgba(255,255,255,.7)',
    primary2Color: '#fff',
    textColor: '#fff',
    secondaryTextColor: 'rgba(255,255,255,.7)',
    alternateTextColor: '#303030',
    canvasColor: '#303030',
    borderColor: 'rgba(255,255,255,.3)',
    disabledColor: 'rgba(255,255,255,.3)',
    pickerHeaderColor: 'rgba(255,255,255,.12)',
    clockCircleColor: 'rgba(255,255,255,.12)',
  }
}); */