import classnames from 'classnames';
import React, { forwardRef, ForwardRefRenderFunction, HTMLAttributes, PropsWithChildren, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { GenreModel, genres } from '../config/lists';
import { normURL, translateURL } from '../config/shared';

interface GenresProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  scrollable?: boolean;
}

const Genres: ForwardRefRenderFunction<HTMLDivElement, GenresProps> = ({
  className,
  scrollable,
}: GenresProps, ref: Ref<HTMLDivElement>) => {
  const { t } = useTranslation(['lists']);

  return (
    <div className={classnames('genres', 'badges', scrollable ? 'scrollable' : 'fullview', className)} ref={ref}>
      <div className='content'>
        {genres.map(({ canonical, id, name }: GenreModel) => (
          <NavLink to={`/genre/${normURL(name)}`} key={id} className='badge'>
            {t(`GENRE_${translateURL(canonical)}`)}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default forwardRef(Genres);