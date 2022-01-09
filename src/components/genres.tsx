import classnames from 'classnames';
import React, { forwardRef, ForwardRefRenderFunction, HTMLAttributes, PropsWithChildren, Ref } from 'react';
import { NavLink } from 'react-router-dom';
import { GenreModel, genres } from '../config/lists';
import { normURL } from '../config/shared';

interface GenresProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  scrollable?: boolean;
}

const Genres: ForwardRefRenderFunction<HTMLDivElement, GenresProps> = (props: GenresProps, ref: Ref<HTMLDivElement>) => (
  <div className={classnames('genres', 'badges', props.scrollable ? 'scrollable' : 'fullview', props.className)} ref={ref}>
    <div className='content'>
      {genres.map(({ id, name }: GenreModel) => (
        <NavLink to={`/genre/${normURL(name)}`} key={id} className='badge'>
          {name}
        </NavLink>
      ))}
    </div>
  </div>
);

export default forwardRef(Genres);