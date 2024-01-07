import type { FC } from 'react';
import type { UserModel } from '../../types';
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
  <>
    <Overlay onClick={onToggle} />
    <div role='dialog' aria-describedby='edit user' className='dialog light'>
      <ProfileForm user={user} />
    </div>
  </>
);
 
export default UserForm;