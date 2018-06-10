import React from 'react';
import { icon } from '../config/icons';
import { auth, reviewsRef, uid } from '../config/firebase';
import { stringType } from '../config/types';
import Review from './review';

export default class Reviews extends React.Component {
	state = {
    bid: this.props.bid,
    uid: uid,
    reviews: null,
    reviewsCount: 0,
    desc: false,
    limit: 10,
    loading: true,
    page: 1, // TODO PAGINATION
    lastVisible: null,
    errors: {}
  }

  static propTypes = {
    bid: stringType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.bid !== state.bid) { return { bid: props.bid }}
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
    const { desc, limit, uid } = this.state;
    reviewsRef(bid).onSnapshot(snap => {
      if (!snap.empty) {
        this.setState({ reviewsCount: snap.docs.length });
        reviewsRef(bid).orderBy('created_num', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
          let reviews = [];
          snap.forEach(review => review.data().createdByUid !== (uid) && reviews.push(review.data()));
          this.setState({ 
            reviews: reviews,
            loading: false,
            page: 1,
            //lastVisible: snap.docs[snap.docs.length-1]
          });
        }).catch(error => console.warn("Error fetching reviews:", error));
      } else {
        this.setState({ 
          reviewsCount: 0,
          reviews: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
    });
  }

  fetch = direction => {
    const { bid, desc, /* firstVisible, lastVisible,  */limit, page, reviewsCount } = this.state;
    //console.log({'direction': direction, 'firstVisible': firstVisible, 'lastVisible': lastVisible.id});
    //const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter = (direction === 'prev') ? (page > 1) ? ((page - 1) * limit) - limit : 0 : ((page * limit) > reviewsCount) ? ((page - 1) * limit) : page * limit;

    this.setState({ loading: true });
    
    let nextReviews = [];
		reviewsRef(bid).orderBy('created_num', desc ? 'desc' : 'asc').startAfter(startAfter).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(review => nextReviews.push(review.data()));
        this.setState(prevState => ({ 
          reviews: nextReviews,
          loading: false,
          page: (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.reviewsCount) ? prevState.page : prevState.page + 1,
          //lastVisible: nextSnap.docs[nextSnap.docs.length-1] || prevState.lastVisible
        }));
        //console.log(nextReviews);
        //console.log({'direction': direction, 'page': page});
      } else {
        this.setState({ 
          reviews: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
		}).catch(error => console.warn("Error fetching next review:", error));
  }
	
	render() {
    const { bid, limit, loading, page, reviews, reviewsCount } = this.state;

    if (!reviews || reviews.length === 0) {
      if (loading) { 
        return null; 
      } else { 
        return (
          <div className="card dark reviews">
            <div className="info-row empty text-align-center">Non ci sono ancora recensioni<span className="hide-xs"> per questo libro</span>.</div>
          </div>
        );
      }
    }

		return (
      <React.Fragment>
        <div className="card dark reviews">
          {reviews.map(review => 
            <Review 
              key={review.createdByUid} 
              bid={bid}
              review={{
                photoURL: review.photoURL || '',
                displayName: review.displayName || '',
                createdByUid: review.createdByUid || '',
                created_num: review.created_num || 0,
                likes: review.likes || {},
                rating_num: review.rating_num || 0,
                text: review.text || '',
                title: review.title || '',
              }} 
            />
          )}
        </div>
        {reviewsCount > limit &&
          <React.Fragment>
            <button 
              disabled={page < 2 && 'disabled'} 
              className="btn sm clear prepend" 
              onClick={() => this.fetch('prev')} title="precedente">
              {icon.chevronLeft()}
            </button>
            <button 
              disabled={page > (reviewsCount / limit) && 'disabled'} 
              className="btn sm clear append" 
              onClick={() => this.fetch('next')} title="successivo">
              {icon.chevronRight()}
            </button>
          </React.Fragment>
        }
      </React.Fragment>
		);
	}
}