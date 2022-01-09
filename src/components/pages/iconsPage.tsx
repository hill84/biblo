import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { ThemeProvider } from '@material-ui/styles';
import React, { ChangeEvent, FC, Fragment, useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import icon from '../../config/icons';
import { app } from '../../config/shared';
import { darkTheme } from '../../config/themes';
import SnackbarContext, { OpenSnackbarType } from '../../context/snackbarContext';

const copy = (text: string, openSnackbar: OpenSnackbarType): void => {
  if (typeof window !== 'undefined') {
    navigator.clipboard.writeText(text).then((): void => {
      openSnackbar('Copiato negli appunti', 'success');
    }, (err: Error): void => {
      openSnackbar('Errore interno', 'error');
      console.warn('Async: Could not copy text: ', err);
    });
  }
};

const IconsPage: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [searchText, setSearchText] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setSearchText(value);
  };
  
  const highlightedText = (text: string) => {
    const arr: string[] = text.split(searchText);
    return (
      <Fragment>
        {arr[0]}<span className='primary-text'>{searchText}</span>{arr[1]}
      </Fragment>
    );
  };

  return (
    <div className='container' id='iconsPageComponent'>
      <Helmet>
        <title>{app.name} | Icone</title>
      </Helmet>
      <h2>Icone di sistema</h2>

      <div className='card'>
        <ThemeProvider theme={darkTheme}>
          <TextField
            fullWidth
            id='search'
            name='search'
            type='text'
            label='Cerca'
            placeholder='es: account'
            value={searchText || ''}
            onChange={onChange}
            variant='outlined'
            size='small'
          />
        </ThemeProvider>

        <div>&nbsp;</div>

        <div className='row'>
          {Object.keys(icon).filter((item: string): boolean => searchText.length > 1 ? item.includes(searchText) : Boolean(item)).map(((item: string, i: number) => 
            <div className='col text-center' key={i}>
              <div className='row'>
                <Tooltip title={item}>
                  <div
                    className='col'
                    role='button'
                    tabIndex={0}
                    onClick={() => copy(item, openSnackbar)}
                    onKeyDown={() => copy(item, openSnackbar)}>
                    <button type='button' className='btn lg centered icon rounded flat'>
                      {icon[item]}
                    </button>
                  </div>
                </Tooltip>
              </div>
              {searchText.length > 1 && (
                <div className='row'>
                  <div className='col ellipsis text-sm'>{highlightedText(item)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>   
    </div>
  );
};

export default IconsPage;