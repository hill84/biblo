import React from 'react';
import BookCollection from '../bookCollection';

const Collection = props => {
  return (
    <div id="CollectionComponent" className="container">
      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <BookCollection cid={props.match.params.cid} pagination={false} stacked={true} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">...</div>
          <div className="card">...</div>
        </div>
      </div>
    </div>
  );
};

export default Collection;