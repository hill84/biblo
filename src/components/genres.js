import React from 'react';
import { NavLink } from 'react-router-dom';
import { genres } from '../config/lists';
import { normURL } from '../config/shared';

const Genres = React.forwardRef((props, ref) => (
  <div className={`genres badges ${props.scrollable ? 'scrollable' : 'fullview'}`} ref={ref}>
    <div className="content">
      {genres.map(genre => <NavLink to={`/genre/${normURL(genre.name)}`} key={genre.id} className="badge">{genre.name}</NavLink>)}
    </div>
  </div>
));

export default Genres;