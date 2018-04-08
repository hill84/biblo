import React from 'react';
import { Link } from 'react-router-dom';
import { reviewType } from '../config/types';
//import { CircularProgress } from 'material-ui';
import { timeSince } from '../config/shared';
import Rating from './rating';
import Avatar from './avatar';
  
const Review = props => (
  <div className="row review">
    <Link to="/" className="col-auto left">
      <Avatar src={undefined} alt="Mario Rossi" />
    </Link>
    <div className="col right">
      <div className="header">
        <div className="row">
          <Link to="/" className="col-auto author">
            <h3>Mario Rossi</h3>
          </Link>
          <div className="col text-align-right rating"><Rating ratings={{rating_num: 0}} /></div>
        </div>
      </div>
      <h4 className="title">Titolo</h4>
      <p className="text">Testo della recensione</p>
      <div className="row">
        <div className="col-auto likes">Like</div>
        <div className="col text-align-right date">Date</div>
      </div>
    </div>
  </div>
);

Review.propTypes = {
  review: reviewType.isRequired
}

export default Review;