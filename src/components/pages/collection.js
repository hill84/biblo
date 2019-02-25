import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import { Link } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { abbrNum, getInitials, isTouchDevice, normalizeString, screenSize } from '../../config/shared';
import { userType } from '../../config/types';
import BookCollection from '../bookCollection';
import MinifiableText from '../minifiableText';
import NoMatch from '../noMatch';
import { skltn_rows } from '../skeletons';

export default class Collection extends React.Component {
  state = {
    cid: this.props.match.params.cid,
    collection: null,
    collections: null,
    followers: null,
    follow: false,
    loading: true,
    loadingCollections: true,
    screenSize: screenSize()
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
    window.addEventListener('resize', this.updateScreenSize);
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.updateScreenSize);
    this.unsubCollectionFollowersFetch && this.unsubCollectionFollowersFetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if (this.state.cid !== prevState.cid || this.props.user !== prevProps.user) {
        this.fetch();
      }
    }
  }

  updateScreenSize = () => this.setState({ screenSize: screenSize() });

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
          this.setState({ collection: snap.data(), loading: false });
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
          this.setState({ collections, loadingCollections: false });
        }
      } else {
        if (this._isMounted) {
          this.setState({ collections: null, loadingCollections: false });
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
    const { cid, collection, collections, followers, follow, loading, loadingCollections, screenSize } = this.state;
    const { history, location, user } = this.props;

    const isScrollable = isTouchDevice() || screenSize === 'xs' || screenSize === 'sm';
    const isTextMinified = screenSize === 'xs' || screenSize === 'sm' || screenSize === 'md';

    if (!collection && !loading) {
      return <NoMatch title="Collezione non trovata" history={history} location={location} />
    }

    return (
      <div id="CollectionComponent" className="container">
        <div className="row">
          <div className="col">
            <div className="sticky no-sticky-md">
              
              <div className="card dark collection-profile">
                <h2>{cid}</h2>
                {loading ? skltn_rows : 
                  <React.Fragment>
                    <div className="info-row description">
                      <MinifiableText text={collection.description} maxChars={700} textMinified={isTextMinified} />
                    </div>
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
                      <div className="counter last inline">
                        {/* followers ? abbrNum(followers.length) : 0} {isScrollable ? icon.account() : 'follower' */}
                        {followers ? followers.length > 3 && followers.length < 13 ? 
                          <div className="bubble-group inline">
                            {followers.slice(0,3).map(item => (
                              <Link to={`/dashboard/${item.uid}`} key={item.displayName} className="bubble">
                                <Avatar className="avatar" src={item.photoURL} alt={item.displayName}>
                                  {!item.photoURL && getInitials(item.displayName)}
                                </Avatar>
                              </Link>
                            ))}
                            <div className="bubble empty">{followers.length - 3}+</div>
                          </div>
                        : `${abbrNum(followers.length)} ${isScrollable ? icon.account() : 'follower'}` : ''}
                      </div>
                    </div>
                  </React.Fragment>
                }
              </div>
              
              <div className="card dark text-left">
                <h2>Altre collezioni</h2>
                <div className={`badges ${isScrollable ? 'scrollable' : 'fullview'}`}>
                  <div className="content">
                    {loadingCollections ? skltn_rows : collections.map(collection => 
                      <Link 
                        to={`/collection/${collection.title}`} 
                        key={normalizeString(collection.title)} 
                        className="badge">
                        {collection.title}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
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