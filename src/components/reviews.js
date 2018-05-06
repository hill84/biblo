import React from 'react';
import { auth, reviewsRef, uid } from '../config/firebase';
import { stringType } from '../config/types';
import Review from './review';

export default class Reviews extends React.Component {
	state = {
    bid: this.props.bid,
    uid: uid,
    reviews: null,
    loading: false,
    page: 1, // TODO PAGINATION
    lastVisible: null,
    errors: {}
  }

  static propTypes = {
    bid: stringType.isRequired
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.bid !== prevState.bid) { return { bid: nextProps.bid }}
    return null;
  }

  componentDidMount(prevState) {
    this.fetchReviews(this.state.bid);
    this.unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ uid: user.uid });
      } else {
        this.setState({ uid: null });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.bid !== prevState.bid || this.state.uid !== prevState.uid){
      this.fetchReviews(this.state.bid);
      //console.log('Fetched updated reviews');
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fetchReviews = bid => { 
    this.setState({ loading: true });
    reviewsRef(bid).orderBy('created_num').orderBy('likes_num').limit(10).onSnapshot(snap => {
      //console.log(snap);
      if (!snap.empty) {
        //console.log(this.state.uid);
        let reviews = [];
        snap.forEach(review => review.data().createdByUid !== (this.state.uid) && reviews.push(review.data()));
        this.setState({ 
          reviews: reviews,
          loading: false,
          page: 1,
          //lastVisible: snap.docs[snap.docs.length-1]
        });
        //console.log(reviews.length);
      } else {
        this.setState({ 
          reviews: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
    });
  }
	
	render() {
    const { bid, loading, reviews } = this.state;

    if (!reviews || reviews.length === 0) {
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
            bid={bid}
            like={review.likes.indexOf(uid) > -1 ? true : false}
            review={{
              photoURL: review.photoURL || '',
              displayName: review.displayName || '',
              createdByUid: review.createdByUid || '',
              created_num: review.created_num || 0,
              likes: review.likes || {},
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