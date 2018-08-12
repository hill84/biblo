import React from 'react';
import NavLink from 'react-router-dom/NavLink';
import { genres } from '../config/lists';

const Genres = props => (
  <div className={`genres ${props.scrollable ? 'scrollable' : 'fullview'}`}>
    {genres.map(genre => <NavLink to={`/genre/${genre.name}`} key={genre.id}>{genre.name}</NavLink>)}
  </div>
);

export default Genres;