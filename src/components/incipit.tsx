import Tooltip from '@material-ui/core/Tooltip';
import classnames from 'classnames';
import React, { FC, Fragment, KeyboardEvent, MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SayButton } from 'react-say';
import icon from '../config/icons';
import { incipitKey } from '../config/storage';
import '../css/incipit.css';
import useLocalStorage from '../hooks/useLocalStorage';
import Overlay from './overlay';

interface IncipitProps {
  copyrightHolder?: string;
  incipit: string;
  onToggle: (e: MouseEvent | KeyboardEvent) => void;
  publication?: string;
  title: string;
}

const Incipit: FC<IncipitProps> = ({
  copyrightHolder,
  incipit,
  onToggle,
  publication,
  title
}: IncipitProps) => {
  const [big, setBig] = useLocalStorage<boolean>(incipitKey.fontBig, false);
  const [dark, setDark] = useLocalStorage<boolean>(incipitKey.themeDark, false);

  const { t } = useTranslation(['common']);

  const onToggleDarkTheme = (): void => setDark(!dark);
  const onToggleSize = (): void => setBig(!big);

  const publicationYear = useMemo((): number | undefined => publication ? new Date(publication).getFullYear() : undefined, [publication]);

  return (
    <Fragment>
      <div role='dialog' aria-describedby='incipit' className={classnames('dialog', 'book-incipit', 'force-theme', dark ? 'dark' : 'light')}>
        <div className='absolute-content'>
          <div role='navigation' className='head nav row'>
            <strong className='col title'>{title}</strong>
            <div className='col-auto btn-row'>
              <SayButton text={incipit}>
                <Tooltip title={t('ACTION_LISTEN')} placement='bottom'>
                  <div className='btn rounded icon flat audio'>{icon.voice}</div>
                </Tooltip>
              </SayButton>
              <Tooltip title={t('ACTION_CHANGE_FORMAT')} placement='bottom'>
                <button type='button' className='btn rounded icon flat' onClick={onToggleSize}>{icon.formatSize}</button> 
              </Tooltip>
              <Tooltip title={t('ACTION_CHANGE_THEME')} placement='bottom'>
                <button type='button' className='btn rounded icon flat' onClick={onToggleDarkTheme}>{icon.brightness_6}</button> 
              </Tooltip>
              <Tooltip title={t('ACTION_CLOSE')} placement='bottom'>
                <button type='button' className='btn rounded icon flat' onClick={onToggle}>{icon.close}</button>
              </Tooltip>
            </div>
          </div>
          <p className={classnames('incipit', big ? 'big' : 'regular')}>{incipit}</p>
          {copyrightHolder && <p className='copyright'>&copy; {publicationYear} {copyrightHolder}</p>}
        </div>
      </div>
      <Overlay onClick={onToggle} />
    </Fragment>
  );
};
 
export default Incipit;