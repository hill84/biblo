import React from 'react';
import { funcType, userType } from '../../config/proptypes';
import Overlay from '../overlay';
import ProfileForm from './profileForm';

const UserForm = ({ user, onToggle }) => (
  <>
    <Overlay onClick={onToggle} />
    <div role="dialog" aria-describedby="edit user" className="dialog light">
      <ProfileForm user={user} />
    </div>
  </>
);

UserForm.propTypes = {
  user: userType.isRequired,
  onToggle: funcType.isRequired
}
 
export default UserForm;