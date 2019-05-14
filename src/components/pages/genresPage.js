import React from 'react';
import { Helmet } from 'react-helmet';
import { InView } from 'react-intersection-observer';
import { genres } from '../../config/lists';
import { app } from '../../config/shared';
import { funcType } from '../../config/types';
import BookCollection from '../bookCollection';

class GenresPage extends React.Component {
  state = {}

  static propTypes = {
    openSnackbar: funcType.isRequired
  }
  
  render() { 
    const { openSnackbar } = this.props;
    const rootMargin = '300px';

    return (
      <div id="GenresPageComponent">
        <Helmet>
          <title>{app.name} | Generi</title>
        </Helmet>
        <div className="container">
          {genres.map(item =>
            <InView key={item.id} triggerOnce rootMargin={rootMargin}>
              {({ inView, ref }) => 
                <div className="card dark card-fullwidth-sm" /* style={{'--cardBg': item.color}} */ ref={ref}>
                  <BookCollection cid={item.name} openSnackbar={openSnackbar} desc={true} pagination={false} limit={7} inView={inView} scrollable />
                </div>
              }
            </InView>
          )}
        </div>
      </div>
    );
  }
}
 
export default GenresPage;