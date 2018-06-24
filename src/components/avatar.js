import React from 'react';
import { numberType, stringType } from '../config/types';
//import Avatar from '@material-ui/core/Avatar';

const Avatar = props => (
  <div className="avatar">
    AVATAR
  </div>
);

Avatar.propTypes = {
  src: stringType,
  alt: stringType,
  size: numberType
}

export default Avatar;