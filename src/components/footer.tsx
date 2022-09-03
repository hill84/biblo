import i18next from 'i18next';
import moment from 'moment';
import React, { ChangeEvent, FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { app } from '../config/shared';
import '../css/footer.css';
import { fallbackLanguage, supportedLanguages } from '../i18n';
import { Language } from '../types';

const lsLng = 'i18nextLng';

const Footer: FC = () => {
  const { i18n, t } = useTranslation(['common']);

  const currentLng: string | undefined = localStorage.getItem(lsLng) || undefined;

  useEffect(() => {
    if ((currentLng?.length || 0) > 2) {
      i18next.changeLanguage(fallbackLanguage.id);
      moment.locale(fallbackLanguage.id);
    } else {
      moment.locale(currentLng);
    }
  }, [currentLng]);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const id: string = e.target.value;
    i18n.changeLanguage(id);
    moment.locale(id);
  };

  return (
    <footer className='bottom-bar dark'>
      <div className='container bottompend pad-v-xs'>
        <div className='row'>
          <div className='col hide-md'><p>© {app.name} {new Date().getFullYear()}</p></div>
          <div className='col-md-auto col-12 text-center-md text-right'>
            <ul className='nolist inline-items info-row'>
              <li className='counter hide-sm'><Link to='/about'>{t('PAGE_ABOUT')}</Link></li>
              <li className='counter'><Link to='/terms'>{t('PAGE_TERMS')}</Link></li>
              <li className='counter'><Link to='/privacy'>{t('PAGE_PRIVACY')}</Link></li>
              <li className='counter'><Link to='/cookie'>{t('PAGE_COOKIES')}</Link></li>
              <li className='counter'><Link to='/help'>{t('PAGE_HELP')}</Link></li>
              <li className='counter'>
                <select
                  onChange={handleLanguageChange}
                  value={currentLng}>
                  {supportedLanguages.map(({ id, label }: Language) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;