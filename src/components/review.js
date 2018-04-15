import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, uid } from '../config/firebase';
import { icon } from '../config/icons';
import { timeSince } from '../config/shared';
import { reviewType } from '../config/types';
import Avatar from './avatar';
import Rating from './rating';

const Review = props => (
  <div className="review" id={(props.review.createdByUid === uid) && 'own-review'}>
    <div className="row">
      <Link to={`/dashboard/${props.review.createdByUid}`} className="col-auto left">
        <Avatar src={props.review.photoURL} alt={props.review.displayName} />
      </Link>
      <div className="col right">
        <div className="head row">
          <Link to={`/dashboard/${props.review.createdByUid}`} className="col-auto author">
            <h3>{props.review.displayName}</h3>
          </Link>
          <div className="col text-align-right rating">
            <Rating ratings={{rating_num: props.review.rating_num}} />
          </div>
        </div>
        {props.review.title && <h4 className="title">{props.review.title}</h4>}
        <p className="text">{props.review.text}</p>
        <div className="foot row">
          <div className="col-auto likes">
            <div className="counter">
              <button className={`link thumb up ${props.review.like}`} disabled={!isAuthenticated() || (props.review.createdByUid === uid)} title="mi piace">{icon.thumbUp()}</button> {(props.review.likes_num > 0) || (props.review.createdByUid === uid) ? props.review.likes_num : 'Mi piace'}
            </div>
          </div>
          <div className="col text-align-right date">{timeSince(props.review.created_num)}</div>
        </div>
      </div>
    </div>
  </div>
);

Review.propTypes = {
  review: reviewType.isRequired
}

export default Review;