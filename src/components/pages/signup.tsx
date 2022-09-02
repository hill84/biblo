import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import SignupForm from '../forms/signupForm';

const Signup: FC = () => {
  const { t } = useTranslation(['common']);

  return (
    <div className='card-container pad-v' id='signupComponent'>
      <Helmet>
        <title>{app.name} | {t('PAGE_SIGNUP')}</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
      <h2>{t('PAGE_SIGNUP')}</h2>
      <div className='card light'>
        <SignupForm />
      </div>
      <div className='sub-footer'>
        {t('ARE_YOU_ALREADY_REGISTERED')} <Link to='/login'>{t('ACTION_LOGIN')}</Link>
      </div>
    </div>
  );
};

export default Signup;