import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';
import { Link } from 'react-router-dom';
import { abbrNum, getInitials } from '../../config/shared';
import { arrayType, numberType, stringType } from '../../config/types';

const Bubbles = props => {
  const count = props.items?.length;
  const text = count && <><b>{abbrNum(count)}</b> <span className="light-text">{props.label}</span></>;

  return (
    props.items ? count > 2 && count < 100 ? (
      <>
        <div className="bubble-group inline">
          {props.items.slice(0, props.limit).map(item => (
            <Link to={`/dashboard/${item.uid}`} key={item.displayName} className="bubble">
              <Tooltip title={item.displayName} placement="bottom">
                <Avatar className="avatar" src={item.photoURL} alt={item.displayName}>
                  {!item.photoURL && getInitials(item.displayName)}
                </Avatar>
              </Tooltip>
            </Link>
          ))}
        </div>
        {text}
      </>
    ) : text : ''
  );
}

Bubbles.propTypes = {
  // isScrollable: boolType,
  items: arrayType,
  label: stringType,
  limit: numberType
}

Bubbles.defaultProps = {
  // isScrollable: false,
  items: null,
  label: 'follower',
  limit: 3
}
 
export default Bubbles;