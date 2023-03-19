import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { ThemeProvider } from '@material-ui/styles';
import type { ChangeEvent, FC } from 'react';
import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import icon from '../../config/icons';
import { app } from '../../config/shared';
import { darkTheme } from '../../config/themes';
import type { OpenSnackbarType } from '../../context/snackbarContext';
import SnackbarContext from '../../context/snackbarContext';

const IconsPage: FC = () => {
  const { openSnackbar } = useContext(SnackbarContext);
  const [searchText, setSearchText] = useState<string>('');

  const { t } = useTranslation(['common', 'form']);
  
  const copy = (text: string, openSnackbar: OpenSnackbarType): void => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text).then((): void => {
        openSnackbar(t('SUCCESS_COPIED'), 'success');
      }, (err: Error): void => {
        openSnackbar(err, 'error');
        console.warn('Async: Could not copy text: ', err);
      });
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setSearchText(value);
  };
  
  const highlightedText = (text: string) => {
    const arr: string[] = text.split(searchText);
    return (
      <>
        {arr[0]}<span className='primary-text'>{searchText}</span>{arr[1]}
      </>
    );
  };

  return (
    <div className='container' id='iconsPageComponent'>
      <Helmet>
        <title>{app.name} | {t('PAGE_ICONS')}</title>
      </Helmet>
      <h2>{t('PAGE_ICONS')}</h2>

      <div className='card'>
        <ThemeProvider theme={darkTheme}>
          <TextField
            fullWidth
            id='search'
            name='search'
            type='text'
            label={t('ACTION_SEARCH')}
            placeholder={t('form:PLACEHOLDER_EG_STRING', { string: 'account' })}
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