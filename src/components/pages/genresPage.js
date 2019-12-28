import React from 'react';
import { Helmet } from 'react-helmet-async';
import { InView } from 'react-intersection-observer';
import { genres } from '../../config/lists';
import { app, denormURL } from '../../config/shared';
import { funcType } from '../../config/types';
import BookCollection from '../bookCollection';

const rootMargin = '300px';

const GenresPage = props => {
  const { openSnackbar } = props;

  return (
    <>
      <Helmet>
        <title>{app.name} | Generi</title>
      </Helmet>
      <div className="container">
        {genres.map(item =>
          <InView key={item.id} triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" /* style={{'--cardBg': item.color}} */ ref={ref}>
                <BookCollection cid={denormURL(item.name)} openSnackbar={openSnackbar} desc pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>
        )}
      </div>
    </>
  );
}

GenresPage.propTypes = {
  openSnackbar: funcType.isRequired
}
 
export default GenresPage;