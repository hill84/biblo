import React from 'react';
import { ratingsType } from '../config/types';
import Rater from 'react-rater';

export default class Rating extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      ratings_num: 0,
      totalRating_num: 0,
      averageRating_num: 0
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ratings_num: nextProps.ratings.ratings_num,
      totalRating_num: nextProps.ratings.totalRating_num,
      averageRating_num: Math.round(nextProps.ratings.totalRating_num / nextProps.ratings.ratings_num * 10) / 10 || 0
    });
  }

  render() { 
    return (
      <div className="rating">
        <Rater interactive={false} total={5} rating={this.state.averageRating_num} /> 
        &nbsp;<span>{this.state.averageRating_num}</span>
        &nbsp;&nbsp;&nbsp;<span>{this.state.ratings_num} voti</span>
      </div>
    )
  }
}

Rating.PropTypes = {
  ratings: ratingsType
}