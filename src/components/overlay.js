import React from 'react';
import { funcType } from '../config/types';

const Overlay = props => {
  return (
    <div role="button" label="overlay" tabIndex={0} className="overlay" onClick={props.onClick} onKeyDown={props.onClick} />
  );
}

Overlay.propTypes = {
  onClick: funcType.isRequired
}
 
export default Overlay;
