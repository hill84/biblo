import classnames from 'classnames';
import React, { CSSProperties } from 'react';
import '../css/skeletons.css';

const skltnArr = (limit: number, className: string): JSX.Element[] => (
  [...Array(limit)].map((_e, i: number) => <div key={i} className={classnames('skltn', className)} />)
);

const skltn = (limit: number, className: string, stacked?: boolean, style?: CSSProperties): JSX.Element => (
  <div className={classnames('skltn', 'shelf-row', { stacked })} style={style}>
    {skltnArr(limit, className)}
  </div>
);

export const skltn_shelfRow = skltn(7, 'book');

export const skltn_shelfStack = skltn(7, 'book', true, { height: 'calc(7 * (var(--shelf-rowHeight) + 15px))', });

export const skltn_bubbleRow = skltn(9, 'bubble');

export const skltn_notification = (limit = 5) => skltnArr(limit, 'notification');

export const skltn_avatarRow = (limit = 5) => skltnArr(limit, 'avatar-row');