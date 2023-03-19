import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import LoginForm from '../forms/loginForm';

const Login: FC<RouteComponentProps> = ({ location }: RouteComponentProps) => {
  const { t } = useTranslation(['common']);

  return (
    <div className='card-container pad-v' id='loginComponent'>
      <Helmet>
        <title>{app.name} | {t('PAGE_LOGIN')}</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
      <h2>{t('PAGE_LOGIN')}</h2>
      <div className='card light'>
        <LoginForm location={location} />
      </div>
      <Link to='/password-reset' className='sub-footer'>
        {t('FORGOT_PASSWORD')}
      </Link>
    </div>
  );
};

export default Login;