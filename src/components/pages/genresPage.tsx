import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import type { GenreModel } from '../../config/lists';
import { genres } from '../../config/lists';
import { app, denormURL, translateURL } from '../../config/shared';
import BookCollection from '../bookCollection';

const GenresPage: FC = () => {
  const { t } = useTranslation(['common', 'lists']);

  return (
    <>
      <Helmet>
        <title>{app.name} | {t('PAGE_GENRES')}</title>
      </Helmet>
      <div className='container'>
        {genres.map(({ canonical, id, name }: GenreModel) =>
          <InView key={id} triggerOnce rootMargin='300px'>
            {({ inView, ref }) => (
              <div className='card dark card-fullwidth-sm' /* style={{'--cardClr': item.color}} */ ref={ref}>
                <BookCollection
                  cid={denormURL(name)}
                  desc pagination={false}
                  label={t(`lists:GENRE_${translateURL(canonical)}`)}
                  limit={7}
                  inView={inView}
                  scrollable
                />
              </div>
            )}
          </InView>
        )}
      </div>
    </>
  );
};

export default GenresPage;