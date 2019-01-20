import React from 'react';
import { NavLink } from 'react-router-dom';
import { genres } from '../config/lists';

const Genres = props => (
  <div className={`genres badges ${props.scrollable ? 'scrollable' : 'fullview'}`}>
    <div className="content">
      {genres.map(genre => <NavLink to={`/genre/${genre.name}`} key={genre.id} className="badge">{genre.name}</NavLink>)}
    </div>
  </div>
);

export default Genres;