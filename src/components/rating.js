import React from 'react';
import { ratingsType } from '../config/types';
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

  componentWillReceiveProps(nextProps, props) {
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
        <Rater interactive={false} total={5} rating={this.state.averageRating_num} /> 
        <span className="rating-num">{this.state.averageRating_num}</span>
        <span className="label ratings-num">{this.state.ratings_num} voti</span>
      </div>
    )
  }
}

Rating.PropTypes = {
  ratings: ratingsType.isRequired
}