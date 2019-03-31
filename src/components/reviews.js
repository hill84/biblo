import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, latestReviewsRef, reviewersRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType, numberType, stringType, userType } from '../config/types';
import PaginationControls from './paginationControls';
import Review from './review';
import { skltn_review } from './skeletons';

export default class Reviews extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: true,
    limit: this.props.limit,
    loading: true,
    page: 1,
    pagination: this.props.pagination,
    lastVisible: null
  }

  static propTypes = {
    bid: stringType,
    limit: numberType,
    pagination: boolType,
    skeleton: boolType,
    user: userType
  }

  static defaultProps = {
    limit: 5,
    pagination: true,
    skeleton: false
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch(this.props.bid);
  }
  
  componentWillUnmount() {
    this._isMounted = false;
    this.reviewersFetch && this.reviewersFetch();
  }

  componentDidUpdate(prevProps) {
    if (this.props.bid !== prevProps.bid || this.props.user !== prevProps.user){
      this.fetch(this.props.bid);
      // console.log('Fetched updated reviews');
    }
  }

  fetch = bid => { 
    const { openSnackbar } = this.props;
    const { desc, limit } = this.state;
    const ref = bid ? reviewersRef(bid) : latestReviewsRef;
  
    this.reviewersFetch = ref.onSnapshot(fullSnap => { // TODO: remove fullSnap
      if (!fullSnap.empty) {
        this.setState({ count: fullSnap.size });
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
        }).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));
      } else {
        this.setState({ loading: false });
      }
    });
  }

  fetchNext = () => {
    const { desc, items, lastVisible, limit } = this.state;
    const { bid, openSnackbar } = this.props;
    const ref = bid ? reviewersRef(bid) : latestReviewsRef;

    if (this._isMounted) {
      this.setState({ loading: true });
    }
		ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (this._isMounted) {
          this.setState(prevState => ({ 
            items,
            loading: false,
            page: (prevState.page * prevState.limit) > prevState.count ? prevState.page : prevState.page + 1,
            lastVisible: nextSnap.docs[nextSnap.docs.length-1] || prevState.lastVisible
          }));
        }
      } else {
        if (this._isMounted) {
          this.setState({ 
            items: null,
            loading: false,
            page: null,
            lastVisible: null
          });
        }
      }
		}).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));
  }
	
	render() {
    const { items, limit, loading, page, pagination, count } = this.state;
    const { bid, skeleton, user } = this.props;
    
    if (!items) {
      if (loading) { 
        if (!skeleton) {
          return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>; 
        }
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
          {!bid && <h2>Ultime recensioni</h2>}
          {loading && skeleton ? [...Array(limit)].map((e, i) => <React.Fragment key={i}>{skltn_review}</React.Fragment>) :
            items.map((item, index) => 
              <Review 
                key={`${index}_${item.createdByUid}`} 
                bid={bid}
                user={user}
                review={{
                  bid: item.bid || '',
                  photoURL: item.photoURL || '',
                  displayName: item.displayName || '',
                  bookTitle: item.bookTitle,
                  covers: item.covers || [],
                  createdByUid: item.createdByUid || '',
                  created_num: item.created_num || 0,
                  flag: item.flag,
                  dislikes: item.dislikes || {},
                  likes: item.likes || {},
                  rating_num: item.rating_num || 0,
                  text: item.text || '',
                  title: item.title || '',
                }} 
              />
            )
          }
        </div>
        {pagination && count > 0 && items.length < count &&
          <PaginationControls 
            count={count} 
            fetch={this.fetchNext} 
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