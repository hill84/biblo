import React from 'react';
import Rater from 'react-rater';
import { ratingLabels } from '../config/lists';
import { abbrNum } from '../config/shared';
import { boolType, ratingsType } from '../config/types';

const Rating = props => {
  const { labels, ratings } = props;
  const ratings_num = ratings.ratings_num || 0;
  const rating_num = ratings.rating_num || 0;
  const averageRating_num = Math.round(ratings.rating_num / ratings.ratings_num * 10) / 10 || 0;

  return (
    <div className="rating">
      <Rater title={ratingLabels[ratings_num ? averageRating_num : rating_num]} interactive={false} total={5} rating={ratings_num ? averageRating_num : rating_num} />
      {labels && 
        <div className="rating-labels">
          <span className="label rating-num">{ratings_num ? averageRating_num : rating_num}</span>
          <span className="label ratings-num">{abbrNum(ratings_num, 1)} {ratings_num !== 1 ? 'voti' : 'voto'}</span>
        </div>
      }
    </div>
  );
}

Rating.propTypes = {
  ratings: ratingsType.isRequired,
  labels: boolType
}

Rating.defaultProps = {
  labels: null
}
 
export default Rating;