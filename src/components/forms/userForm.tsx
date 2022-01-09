import React, { FC, Fragment } from 'react';
import { UserModel } from '../../types';
import Overlay from '../overlay';
import ProfileForm from './profileForm';

interface UserFormModel {
  user: UserModel;
  onToggle: () => void;
}

const UserForm: FC<UserFormModel> = ({
  user,
  onToggle
}: UserFormModel) => (
  <Fragment>
    <Overlay onClick={onToggle} />
    <div role='dialog' aria-describedby='edit user' className='dialog light'>
      <ProfileForm user={user} />
    </div>
  </Fragment>
);
 
export default UserForm;