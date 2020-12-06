import React from 'react';
import { funcType } from '../config/proptypes';

const Overlay = ({ onClick }) => (
  <div role="button" label="overlay" tabIndex={0} className="overlay" onClick={onClick} onKeyDown={onClick} />
);

Overlay.propTypes = {
  onClick: funcType.isRequired
}
 
export default Overlay;
