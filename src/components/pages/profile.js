import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { funcType, userType } from '../../config/types';
import ProfileForm from '../forms/profileForm';

const Profile = props => {
  const { openSnackbar, user } = props;

  if (!user) return null;

  return (
    <div className="container" id="profileComponent">
      <Helmet>
        <title>{app.name} | Profilo</title>
        <link rel="canonical" href={app.url} />
      </Helmet>
      <div className="card light">
        <ProfileForm openSnackbar={openSnackbar} user={user} />
      </div>
      <div className="text-center"> 
        <Link to={`/dashboard/${user.uid}`} className="btn flat rounded">Vai alla dashboard</Link>
      </div>
    </div>
  );
}

Profile.propTypes = {
  openSnackbar: funcType.isRequired,
  user: userType.isRequired
}
 
export default Profile;