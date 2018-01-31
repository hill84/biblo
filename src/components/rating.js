import React from 'react';
import { ratingsType } from '../config/types';

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
      averageRating_num: Math.round(nextProps.ratings.totalRating_num / nextProps.ratings.ratings_num) || 0
    });
  }

  render() { 
    const { averageRating_num } = this.state;
    return (
      <div className="rating">
        <span>Voto medio: {averageRating_num}</span>
      </div>
    )
  }
}

Rating.PropTypes = {
  ratings: ratingsType
}