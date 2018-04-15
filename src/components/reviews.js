import React from 'react';
import { reviewsRef/* , uid */ } from '../config/firebase';
import { stringType } from '../config/types';
import Review from './review';

export default class Reviews extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      bid: this.props.bid,
      reviews: null,
      loading: false,
      page: 1, // TODO PAGINATION
      lastVisible: null,
      errors: {}
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.bid !== this.props.bid) {
      this.setState({ bid: nextProps.bid });
      this.fetchReviews(nextProps.bid);
    }
  }

  componentDidMount(props) {
    this.fetchReviews(this.state.bid);
  }

  fetchReviews = bid => {
    let reviews = [];
    this.setState({ loading: true });
    reviewsRef(bid).orderBy('created_num').orderBy('likes_num').limit(10).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(review => reviews.push(review.data()));
        this.setState({ 
          reviews: reviews,
          loading: false,
          page: 1,
          //lastVisible: snap.docs[snap.docs.length-1]
        });
        //console.log(reviews);
      } else {
        this.setState({ 
          reviews: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
    }).catch(error => console.warn("Error fetching reviews:", error));
  }
	
	render() {
    const { loading, reviews } = this.state;

    if (!reviews) {
      if (loading) { 
        return null; 
      } else { 
        return (
          <div className="card dark reviews">
            <div className="info-row empty text-align-center">Non ci sono ancora recensioni per questo libro.</div>
          </div>
        );
      }
    }

		return (
      <div className="card dark reviews">
        {reviews/* .filter(review => review.createdByUid !== uid) */.map(review => 
          <Review 
            key={review.createdByUid} 
            review={{
              photoURL: review.photoURL || '',
              displayName: review.displayName || '',
              createdByUid: review.createdByUid || '',
              created_num: review.created_num || 0,
              like: false, // TODO
              likes_num: review.likes_num || 0,
              rating_num: review.rating_num || 0,
              text: review.text || '',
              title: review.title || '',
            }} 
          />
        )}
      </div>
		);
	}
}

Reviews.propTypes = {
  bid: stringType.isRequired
}