import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { auth, isAuthenticated, latestReviewsRef, reviewersRef, authid } from '../config/firebase';
import { stringType } from '../config/types';
import Review from './review';
import PaginationControls from './paginationControls';
/* import InfiniteScroll from 'react-infinite-scroller'; */

export default class Reviews extends React.Component {
	state = {
    bid: this.props.bid,
    uid: authid,
    items: null,
    count: 0,
    desc: true,
    limit: 5,
    loading: true,
    page: 1,
    lastVisible: null
  }

  static propTypes = {
    bid: stringType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.bid !== state.bid) { return { bid: props.bid }}
    return null;
  }

  componentDidMount(prevState) {
    this._isMounted = true;
    this.fetchReviews(this.state.bid);
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({ uid: user.uid });
      } else {
        this.setState({ uid: null });
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if(this.state.bid !== prevState.bid || this.state.uid !== prevState.uid){
        this.fetchReviews(this.state.bid);
        // console.log('Fetched updated reviews');
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetchReviews = bid => { 
    const { desc, limit } = this.state;
    const ref = bid ? reviewersRef(bid) : latestReviewsRef;
  
    ref.onSnapshot(snap => {
      if (!snap.empty) {
        this.setState({ count: snap.docs.length });
        ref.orderBy('created_num', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
          const items = [];
          if (!snap.empty) {
            snap.forEach(item => items.push(item.data()));
            this.setState({
              items, 
              loading: false,
              lastVisible: snap.docs[snap.docs.length-1]
            });
          }
        }).catch(error => console.warn(error));
      } else {
        this.setState({ loading: false });
      }
    });
  }

  fetch = () => {
    const { bid, desc, items, lastVisible, limit } = this.state;
    const ref = bid ? reviewersRef(bid) : latestReviewsRef;

    this.setState({ loading: true });
		ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        this.setState(prevState => ({ 
          items,
          loading: false,
          page: (prevState.page * prevState.limit) > prevState.count ? prevState.page : prevState.page + 1,
          lastVisible: nextSnap.docs[nextSnap.docs.length-1] || prevState.lastVisible
        }));
      } else {
        this.setState({ 
          items: null,
          loading: false,
          page: null,
          lastVisible: null
        });
      }
		}).catch(error => console.warn(error));
  }
	
	render() {
    const { bid, items, limit, loading, page, count } = this.state;

    if (!items || items.length === 0) {
      if (loading) { 
        return <div className="loader relative"><CircularProgress /></div>; 
      } else { 
        return (
          <div className="card dark reviews">
            <div className="info-row empty text-center">
              Non ci sono ancora recensioni<span className="hide-xs"> per questo libro</span>. {!isAuthenticated() && <span><Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per aggiungerne una.</span>}
            </div>
          </div>
        );
      }
    }

		return (
      <React.Fragment>
        <div className="card dark reviews">
          {items.map((item, index) => 
            <Review 
              key={`${index}_${item.createdByUid}`} 
              bid={bid}
              review={{
                bid: item.bid || '',
                photoURL: item.photoURL || '',
                displayName: item.displayName || '',
                bookTitle: item.bookTitle,
                covers: item.covers || [],
                createdByUid: item.createdByUid || '',
                created_num: item.created_num || 0,
                likes: item.likes || {},
                rating_num: item.rating_num || 0,
                text: item.text || '',
                title: item.title || '',
              }} 
            />
          )}
        </div>
        {count > 0 && items.length < count &&
          <PaginationControls 
            count={count} 
            fetchNext={this.fetch} 
            limit={limit}
            loading={loading}
            oneWay
            page={page}
          />
        }
      </React.Fragment>
		);
	}
}