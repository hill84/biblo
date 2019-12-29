import React from 'react';
import '../css/skeletons.css';

const skltnArr = (limit, className) => (
  [...Array(limit)].map((e, i) => <div key={i} className={`skltn ${className}`} />)
);

const skltn = (limit, className, stacked, style) => (
  <div className={`skltn shelf-row ${stacked ? 'stacked' : ''}`} style={style}>
    {skltnArr(limit, className)}
  </div>
);

export const skltn_shelfRow = skltn(7, 'book');

export const skltn_shelfStack = skltn(7, 'book', true, { height: 'calc(7 * (var(--shelf-rowHeight) + 15px))', });

export const skltn_bubbleRow = skltn(9, 'bubble');

export const skltn_notification = (limit = 5) => skltnArr(limit, 'notification');

export const skltn_avatarRow = (limit = 5) => skltnArr(limit, 'avatar-row');