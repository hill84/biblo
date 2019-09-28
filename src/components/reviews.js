import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, reviewersGroupRef, reviewersRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType, funcType, numberType, stringType, userType } from '../config/types';
import PaginationControls from './paginationControls';
import Review from './review';

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
    container: boolType,
    limit: numberType,
    openSnackbar: funcType.isRequired,
    pagination: boolType,
    skeleton: boolType,
    uid: stringType,
    user: userType
  }

  static defaultProps = {
    container: true,
    limit: 5,
    pagination: true,
    skeleton: false
  }

  componentDidMount() {
    this._isMounted = true;
    const { bid, uid } = this.props;
    this.fetch(bid, uid);
  }
  
  componentWillUnmount() {
    this._isMounted = false;
    this.reviewersFetch && this.reviewersFetch();
  }

  componentDidUpdate(prevProps) {
    const { bid, uid, user } = this.props;

    if (bid !== prevProps.bid || uid !== prevProps.uid || user !== prevProps.user){
      this.fetch(bid, uid);
      // console.log('Fetched updated reviews');
    }
  }

  fetch = (bid, uid) => { 
    const { openSnackbar } = this.props;
    const { desc, limit } = this.state;
    const ref = bid ? reviewersRef(bid) : uid ? reviewersGroupRef.where('createdByUid', '==', uid) : reviewersGroupRef;
  
    this.reviewersFetch = ref.onSnapshot(fullSnap => { // TODO: remove fullSnap
      // console.log(fullSnap);
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
    const { bid, openSnackbar, uid } = this.props;
    const ref = bid ? reviewersRef(bid) : uid ? reviewersGroupRef.where('createdByUid', '==', uid) : reviewersGroupRef;

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
    const { bid, container, openSnackbar, skeleton, uid, user } = this.props;
    const skeletons = [...Array(limit)].map((e, i) => <div key={i} className="skltn review" />);
    
    if (loading && !items && !skeleton) {
      return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>;
    }

    const EmptyState = () => (
      <div className="info-row empty text-center">
        Nessuna recensione<span className="hide-xs"> trovata</span>{!isAuthenticated() && !uid && <span>. <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per aggiungerne una.</span>}
      </div>
    );

		return (
      <React.Fragment>
        <div className={`reviews ${container ? 'card dark' : ''}`}>
          {!loading && !items ? <EmptyState /> :
            <React.Fragment>
              <div className="head">
                {!bid && <h2>Ultime recensioni<span className="counter">({items ? items.length : limit} di {count || limit})</span></h2>}
              </div>
              {items && items.map((item, index) => (
                <Review 
                  key={`${index}_${item.createdByUid}`} 
                  bid={bid}
                  openSnackbar={openSnackbar}
                  uid={uid}
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
              ))}
              {loading && skeleton && skeletons}
            </React.Fragment>
          }
        </div>
        {pagination && count > 0 && items && items.length < count &&
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