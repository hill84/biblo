import React from 'react';
import { Helmet } from 'react-helmet-async';
import { InView } from 'react-intersection-observer';
import { genres } from '../../config/lists';
import { app, denormURL } from '../../config/shared';
import BookCollection from '../bookCollection';

const rootMargin = '300px';

const GenresPage = () => (
  <>
    <Helmet>
      <title>{app.name} | Generi</title>
    </Helmet>
    <div className="container">
      {genres.map(item =>
        <InView key={item.id} triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" /* style={{'--cardClr': item.color}} */ ref={ref}>
              <BookCollection cid={denormURL(item.name)} desc pagination={false} limit={7} inView={inView} scrollable />
            </div>
          }
        </InView>
      )}
    </div>
  </>
);
 
export default GenresPage;