import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Link } from 'react-router-dom';
import { collectionRef, collectionsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { normalizeString } from '../../config/shared';
import BookCollection from '../bookCollection';

export default class Collection extends React.Component {
  state = {
    cid: this.props.match.params.cid,
    collection: null,
    collections: null,
    loading: true
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

  componentWillUnmount() { this._isMounted = false; }

  componentDidUpdate(prevProps, prevState) {
		if (this._isMounted) {
      if (this.state.cid !== prevState.cid) {
        this.fetch();
      }
		}
	}

  fetch = () => {
    collectionRef(this.state.cid).get().then(snap => {
      if (!snap.empty) {
        this.setState({
          collection: snap.data(),
          loading: false
        });
      }
    }).catch(error => console.warn(error));

    collectionsRef.get().then(snap => {
      if (!snap.empty) {
        const collections = [];
        snap.forEach(collection => collection.id !== (this.state.cid) && collections.push(collection.data()));
        this.setState({ collections });
      }
    }).catch(error => console.warn(error));
  }

  render() {
    const { cid, collection, collections, loading } = this.state;

    return (
      <div id="CollectionComponent" className="container">
        <div className="row">
          <div className="col">
            <div className="card dark collection-profile">
              {loading ? <div className="loader"><CircularProgress /></div> : 
                <React.Fragment>
                  <h2>{cid}</h2>
                  <p className="description">{collection.description}</p>
                  <div className="info-row">
                    <button className="btn primary" disabled>{icon.plus()} Segui</button>
                    <span className="counter last">0 follower</span>
                  </div>
                </React.Fragment>
              }
            </div>
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