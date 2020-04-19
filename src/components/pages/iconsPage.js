import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { ThemeProvider } from '@material-ui/styles';
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import icon from '../../config/icons';
import { app } from '../../config/shared';
import { darkTheme } from '../../config/themes';
import SnackbarContext from '../../context/snackbarContext';

const copy = (text, openSnackbar) => typeof window !== "undefined" && navigator.clipboard.writeText(text).then(() => {
  openSnackbar('Copiato negli appunti', 'success');
}, error => {
  openSnackbar('Errore interno', 'error');
  console.warn('Async: Could not copy text: ', error);
});

const IconsPage = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [searchText, setSearchText] = useState('');

  const onChange = e => setSearchText(e.target.value);
  
  const highlightedText = text => {
    const arr = text?.split(searchText);
    return <>{arr?.[0]}<span className="primary-text">{searchText}</span>{arr?.[1]}</>;
  };

  return (
    <div className="container" id="iconsPageComponent">
      <Helmet>
        <title>{app.name} | Icone</title>
      </Helmet>
      <h2>Icone di sistema</h2>

      <div className="card">
        <ThemeProvider theme={darkTheme}>
          <TextField
            fullWidth
            id="search"
            name="search"
            type="text"
            label="Cerca"
            placeholder="es: account"
            value={searchText || ''}
            onChange={onChange}
            variant="outlined"
            size="small"
          />
        </ThemeProvider>

        <div>&nbsp;</div>

        <div className="row">
          {Object.keys(icon).filter(item => searchText?.length > 1 ? item.includes(searchText) : item).map((item, i) => 
            <div className="col text-center" key={i}>
              <div className="row">
                <Tooltip title={item}>
                  <div
                    className="col"
                    role="button"
                    tabIndex={0}
                    onClick={() => copy(item, openSnackbar)}
                    onKeyDown={() => copy(item, openSnackbar)}>
                    <button type="button" className="btn lg centered icon rounded flat">
                      {icon[item]}
                    </button>
                  </div>
                </Tooltip>
              </div>
              {searchText?.length > 1 && (
                <div className="row">
                  <div className="col ellipsis text-sm">{highlightedText(item)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>   
    </div>
  );
};

export default IconsPage;