import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { blueGrey900, cyan700, cyan900, orange600, orange800 } from 'material-ui/styles/colors';
//import { emphasize } from 'material-ui/utils/colorManipulator';

export const appName = 'deLibris';

/* https://github.com/mui-org/material-ui/blob/master/src/styles/getMuiTheme.js */
export const muiTheme = getMuiTheme({
    palette: {
        primary1Color: cyan700,
        primary2Color: cyan900,
        accent1Color: orange600,
        accent2Color: orange800,
        pickerHeaderColor: cyan700
    },
    appBar: { height: 60 },
    drawer: { color: blueGrey900 },
    datePicker: { selectColor: cyan700 }
});

export const userAge = userBirthDate => Math.abs(new Date( Date.now() - new Date(userBirthDate).getTime()).getUTCFullYear() - 1970);