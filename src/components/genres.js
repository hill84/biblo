import React, { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { genres } from '../config/lists';
import { normURL } from '../config/shared';
import { boolType, stringType } from '../config/types';

const Genres = forwardRef((props, ref) => (
  <div className={`genres badges ${props.scrollable ? 'scrollable' : 'fullview'} ${props.className}`} ref={ref}>
    <div className="content">
      {genres.map(genre => <NavLink to={`/genre/${normURL(genre.name)}`} key={genre.id} className="badge">{genre.name}</NavLink>)}
    </div>
  </div>
));

Genres.propTypes = {
  className: stringType,
  scrollable: boolType
}

Genres.defaultProps = {
  className: null,
  scrollable: null
}

export default Genres;