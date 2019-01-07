import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { abbrNum, normalizeString } from '../../config/shared';
import BookCollection from '../bookCollection';
import NoMatch from '../noMatch';
import { userType } from '../../config/types';

export default class Collection extends React.Component {
  state = {
    cid: this.props.match.params.cid,
    collection: null,
    collections: null,
    followers: null,
    follow: false,
    loading: true
  }

  static propTypes = {
    user: userType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.match.params.cid !== state.cid) { 
			return { cid: props.match.params.cid }; 
		}
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubCollectionFollowersFetch && this.unsubCollectionFollowersFetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if (this.state.cid !== prevState.cid || this.props.user !== prevProps.user) {
        this.fetch();
      }
    }
  }

  fetch = () => {
    const { cid } = this.state;
    const { user } = this.props;
    collectionRef(cid).get().then(snap => {
      if (!snap.empty) {
        this.unsubCollectionFollowersFetch = collectionFollowersRef(cid).onSnapshot(snap => {
          if (!snap.empty) {
            const followers = [];
            snap.forEach(follower => followers.push(follower.data()));
            this.setState({ followers, follow: user && followers.filter(follower => follower.uid === user.uid).length > 0 });
          } else {
            this.setState({ followers: 0, follow: false });
          }
        });
        if (this._isMounted) {
          this.setState({
            collection: snap.data(),
            loading: false
          });
        }
      } else {
        if (this._isMounted) {
          this.setState({ 
            collection: null,
            followers: null,
            follow: false,
            loading: false 
          });
        }
      }
    }).catch(error => console.warn(error));

    collectionsRef.get().then(snap => {
      if (!snap.empty) {
        const collections = [];
        snap.forEach(collection => collection.id !== (cid) && collections.push(collection.data()));
        if (this._isMounted) {
          this.setState({ collections });
        }
      } else {
        if (this._isMounted) {
          this.setState({ collections: null });
        }
      }
    }).catch(error => console.warn(error));
  }

  onFollow = () => {
    const { cid, follow } = this.state;
    const { user } = this.props;

    if (follow) {
      collectionFollowersRef(cid).doc(user.uid).delete().then().catch(error => console.warn(error));
    } else {
      collectionFollowersRef(cid).doc(user.uid).set({
        uid: user.uid,
        displayName: this.props.user.displayName,
        photoURL: this.props.user.photoURL,
        timestamp: (new Date()).getTime()
      }).then().catch(error => console.warn(error));
    }
  }

  render() {
    const { cid, collection, collections, followers, follow, loading } = this.state;
    const { history, location, user } = this.props;

    if (!collection && !loading) {
      return <NoMatch title="Collezione non trovata" history={history} location={location} />
    }

    return (
      <div id="CollectionComponent" className="container">
        <div className="row">
          <div className="col">
            {loading ? <div aria-hidden="true" className="loader"><CircularProgress /></div> : 
              <div className="card dark collection-profile">
                <h2>{cid}</h2>
                <p className="description">{collection.description}</p>
                <div className="info-row">
                  <button 
                    type="button" 
                    className={`btn ${follow ? 'success error-on-hover' : 'primary'}`} 
                    onClick={this.onFollow} 
                    disabled={!user}>
                    {follow ? 
                      <React.Fragment>
                        <span className="hide-on-hover">{icon.check()} Segui</span>
                        <span className="show-on-hover">Smetti</span>
                      </React.Fragment> 
                    : <span>{icon.plus()} Segui</span> }
                  </button>
                  <span className="counter last disabled">{followers ? abbrNum(followers.length) : 0} {icon.account()}</span>
                </div>
              </div>
            }
            {collections && 
              <div className="card dark text-left">
                <h2>Altre collezioni</h2>
                {collections.map(collection => 
                  <Link 
                    to={`/collection/${collection.title}`} 
                    key={normalizeString(collection.title)} 
                    className="badge">
                    {collection.title}
                  </Link>
                )}
              </div>
            }
          </div>
          <div className="col-md-6">
            <div className="card">
              <BookCollection cid={cid} pagination={false} booksPerRow={1} stacked />
            </div>
          </div>
        </div>
      </div>
    );
  }
}