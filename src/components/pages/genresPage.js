import React from 'react';
import { InView } from 'react-intersection-observer';
import { genres } from '../../config/lists';
import BookCollection from '../bookCollection';

class GenresPage extends React.Component {
  state = {}
  
  render() { 
    const rootMargin = '200px';

    return (
      <div id="GenresPageComponent">
        <div className="container">
          {genres.map(item =>
            <InView key={item.id} triggerOnce rootMargin={rootMargin}>
              {({ inView, ref }) => 
                <div className="card dark card-fullwidth-sm" style={{'--cardBg': item.color}} ref={ref}>
                  <BookCollection cid={item.name} pagination={false} limit={7} inView={inView} scrollable />
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