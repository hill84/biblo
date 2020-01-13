import React from 'react';
import { funcType, userType } from '../../config/types';
import Overlay from '../overlay';
import ProfileForm from './profileForm';

const UserForm = props => {
  const { user, onToggle } = props;
      
  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="edit user" className="dialog light">
        <ProfileForm user={user} />
      </div>
    </>
  );
}

UserForm.propTypes = {
  user: userType.isRequired,
  onToggle: funcType.isRequired
}
 
export default UserForm;