import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { normalizeString } from '../../config/shared';
import BookCollection from '../bookCollection';
import NoMatch from '../noMatch';

export default class Collection extends React.Component {
  state = {
    cid: this.props.match.params.cid,
    collection: null,
    collections: null,
    followers: null,
    loading: true
  }

  static getDerivedStateFromProps(props, state) {
    if (props.match.params.cid !== state.cid) { 
			return { cid: props.match.params.cid }; 
		}
    return null;
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.cid !== prevState.cid) {
      this.fetch();
    }
	}

  fetch = () => {
    collectionRef(this.state.cid).get().then(snap => {
      if (snap.exists) {
        collectionFollowersRef(this.state.cid).get().then(snap => {
          if (!snap.empty) {
            const followers = [];
            snap.forEach(follower => followers.push(follower.data()));
            this.setState({ followers });
          }
        }).catch(error => console.warn(error));
        this.setState({
          collection: snap.data(),
          loading: false
        });
      } else {
        this.setState({ 
          collection: null,
          followers: null,
          loading: false 
        });
      }
    }).catch(error => console.warn(error));

    collectionsRef.get().then(snap => {
      if (!snap.empty) {
        const collections = [];
        snap.forEach(collection => collection.id !== (this.state.cid) && collections.push(collection.data()));
        this.setState({ collections });
      } else {
        this.setState({ collections: null });
      }
    }).catch(error => console.warn(error));
  }

  render() {
    const { cid, collection, collections, followers, loading } = this.state;
    const { history, location } = this.props;

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
                  <button type="button" className="btn primary" disabled>{icon.plus()} Segui</button>
                  <span className="counter last disabled">{followers ? followers.length : 0} follower</span>
                </div>
              </div>
            }
            {collections && 
              <div className="card dark">
                <h2>Altre collezioni</h2>
                {collections.map(collection => 
                  <li key={normalizeString(collection.title)}>
                    <Link to={`/collection/${collection.title}`}>{collection.title}</Link> 
                  </li>
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