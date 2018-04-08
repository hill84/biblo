import React from 'react';
import { numberType, stringType } from '../config/types';
import { Avatar as MuiAvatar } from 'material-ui';

const Avatar = props => (
  <div className="avatar">
    { props.src !== undefined ?
      <MuiAvatar size={props.size} src={props.src} backgroundColor={'transparent'} alt={props.alt} />
    : props.alt &&
      <MuiAvatar size={props.size}>{props.alt.charAt(0)}</MuiAvatar>
    }
  </div>
);

Avatar.propTypes = {
  src: stringType,
  alt: stringType,
  size: numberType
}

export default Avatar;