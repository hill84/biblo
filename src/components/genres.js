import React from 'react';
import { NavLink } from 'react-router-dom';
import { genres } from '../config/lists';

const Genres = props => (
  <div className={`genres ${props.scrollable ? 'scrollable' : 'fullview'}`}>
    <div className="content">
      {genres.map(genre => <NavLink to={`/genre/${genre.name}`} key={genre.id}>{genre.name}</NavLink>)}
    </div>
  </div>
);

export default Genres;