import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { funcType } from '../../config/types';
import UserContext from '../../context/userContext';
import ProfileForm from '../forms/profileForm';

const Profile = props => {
  const { user } = useContext(UserContext);

  const { openSnackbar } = props;

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
        <Link to={`/dashboard/${user.uid}`} className="btn flat rounded">La mia libreria</Link>
      </div>
    </div>
  );
}

Profile.propTypes = {
  openSnackbar: funcType.isRequired
}
 
export default Profile;