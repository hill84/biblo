import React from 'react';
import { Avatar as MuiAvatar } from 'material-ui';

const Avatar = props => (
  <div className="avatar">
    { props.src ?
      <MuiAvatar size={props.size} src={props.src} backgroundColor={'transparent'} alt={props.alt} />
    : props.alt &&
      <MuiAvatar size={props.size}>{props.alt.charAt(0)}</MuiAvatar>
    }
  </div>
);

export default Avatar;