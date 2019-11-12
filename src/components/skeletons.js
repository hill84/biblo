import React from 'react';

const skltn = (n, className, stacked, style) => (
  <div className={`skltn shelf-row ${stacked ? 'stacked' : ''}`} style={style}>
    {[...Array(n)].map((e, i) => <div key={i} className={`skltn ${className}`} />)}
  </div>
);

export const skltn_shelfRow = skltn(7, 'book');

export const skltn_shelfStack = skltn(7, 'book', true, { height: 'calc(7 * (var(--shelf-rowHeight) + 15px))', });

export const skltn_bubbleRow = skltn(9, 'bubble');