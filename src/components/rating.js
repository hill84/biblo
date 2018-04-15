import React from 'react';
import { boolType, ratingsType } from '../config/types';
import { ratingLabels } from '../config/shared';
import Rater from 'react-rater';

export default class Rating extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      ratings_num: this.props.ratings.ratings_num || 0,
      rating_num: this.props.ratings.rating_num || 0,
      averageRating_num: Math.round(this.props.ratings.rating_num / this.props.ratings.ratings_num * 10) / 10 || 0
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        ratings_num: nextProps.ratings.ratings_num,
        rating_num: nextProps.ratings.rating_num,
        averageRating_num: Math.round(nextProps.ratings.rating_num / nextProps.ratings.ratings_num * 10) / 10 || 0
      });
    }
  }

  render() {
    return (
      <div className="rating">
        <Rater title={ratingLabels[this.state.ratings_num ? this.state.averageRating_num : this.state.rating_num]} interactive={false} total={5} rating={this.state.ratings_num ? this.state.averageRating_num : this.state.rating_num} /> 
        {this.props.labels && 
          <div className="rating-labels">
            <span className="label ratings-num">{this.state.ratings_num} {this.state.ratings_num !== 1 ? 'voti' : 'voto'}</span>
          </div>
        }
      </div>
    )
  }
}

Rating.propTypes = {
  ratings: ratingsType.isRequired,
  labels: boolType
}