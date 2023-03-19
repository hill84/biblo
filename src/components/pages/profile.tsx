import type { FC } from 'react';
import { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import UserContext from '../../context/userContext';
import ProfileForm from '../forms/profileForm';

const Profile: FC = () => {
  const { user } = useContext(UserContext);

  const { t } = useTranslation(['common']);

  if (!user) return null;

  return (
    <div className='container' id='profileComponent'>
      <Helmet>
        <title>{app.name} | {t('PAGE_PROFILE')}</title>
        <link rel='canonical' href={app.url} />
      </Helmet>
      <div className='card light'>
        <ProfileForm user={user} />
      </div>
      <div className='text-center'> 
        <Link to={`/dashboard/${user.uid}`} className='btn flat rounded'>
          {t('PAGE_DASHBOARD')}
        </Link>
      </div>
    </div>
  );
};
 
export default Profile;