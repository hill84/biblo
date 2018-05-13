import React from 'react';

export const skltn_shelfRow = <div className="skltn shelf-row">{[...Array(7)].map((e, i) => <div key={i} className="skltn book"></div>)}</div>;

export const skltn_shelfStack = <div className="skltn shelf-row stacked" style={{height: 'calc(7 * (var(--shelf-rowHeight) + 15px))'}}>{[...Array(7)].map((e, i) => <div key={i} className="skltn book"></div>)}</div>;