import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { abbrNum, getInitials } from '../../config/shared';
import { FollowerModel } from '../../types';

interface BubblesProps {
  // isScrollable: boolean;
  items: FollowerModel[];
  label: string;
  limit: number;
}

const Bubbles: FC<BubblesProps> = ({
  // isScrollable = false,
  items = [],
  label = 'follower',
  limit = 3,
}: BubblesProps) => {
  const count: number = items?.length;

  if (!items) return null;

  if (count > 2 && count < 100) return (
    <Fragment>
      <div className='bubble-group inline'>
        {items.slice(0, limit).map(({ displayName, photoURL, uid }: FollowerModel) => (
          <Link to={`/dashboard/${uid}`} key={displayName} className='bubble'>
            <Tooltip title={displayName} placement='bottom'>
              <Avatar className='avatar' src={photoURL} alt={displayName}>
                {!photoURL && getInitials(displayName)}
              </Avatar>
            </Tooltip>
          </Link>
        ))}
      </div>
      <Text count={count} label={label} />
    </Fragment>
  );

  return <Text count={count} label={label} />;
};
 
export default Bubbles;

interface TextProps {
  count: number;
  label: string;
}

const Text: FC<TextProps> = ({ count, label }: TextProps) => {
  if (!count) return null;
  return (
    <Fragment>
      <b>{abbrNum(count)}</b> <span className='light-text'>{label}</span>
    </Fragment>
  );
};