
import { Tooltip } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { collectionFollowersRef, collectionRef, collectionsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { genres } from '../../config/lists';
import { app, denormURL, handleFirestoreError, hasRole, isTouchDevice, normalizeString, normURL, screenSize, truncateString } from '../../config/shared';
import { funcType, historyType, locationType, matchType, userType } from '../../config/types';
import BookCollection from '../bookCollection';
import MinifiableText from '../minifiableText';
import NoMatch from '../noMatch';
import Bubbles from './bubbles';

export default class Collection extends Component {
  state = {
    cid: this.props.match.params.cid,
    collection: null,
    collections: null,
    desc: false,
    filterByName: null,
    filterMenuAnchorEl: null,
    followers: null,
    follow: false,
    loading: true,
    loadingCollections: true,
    screenSize: screenSize()
  }

  static propTypes = {
    history: historyType,
    location: locationType,
    match: matchType,
    openSnackbar: funcType.isRequired,
    user: userType
  }

  static defaultProps = {
    history: null,
    location: null,
    match: null,
    user: null
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

  componentDidUpdate(prevProps, prevState) {
    const { filterByName, cid, desc } = this.state;
    if (this._isMounted) {
      if (filterByName !== prevState.filterByName || cid !== prevState.cid || desc !== prevState.desc || this.props.user !== prevProps.user) {
        this.fetch();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.updateScreenSize);
    this.unsubCollectionFollowersFetch && this.unsubCollectionFollowersFetch();
  }

  updateScreenSize = () => this.setState({ screenSize: screenSize() });

  fetch = () => {
    const { cid, desc, filterByName } = this.state;
    const { openSnackbar, user } = this.props;

    collectionRef(denormURL(cid)).get().then(snap => {
      if (!snap.empty) {
        this.unsubCollectionFollowersFetch = collectionFollowersRef(denormURL(cid)).onSnapshot(snap => {
          if (!snap.empty) {
            const followers = [];
            snap.forEach(follower => followers.push(follower.data()));
            this.setState({ followers, follow: user && followers.filter(follower => follower.uid === user.uid).length > 0 });
          } else {
            this.setState({ followers: null, follow: false });
          }
        });
        if (this._isMounted) {
          this.setState({ collection: snap.data(), loading: false });
        }
      } else if (this._isMounted) {
        this.setState({ 
          collection: null,
          followers: null,
          follow: false,
          loading: false 
        });
      }
    }).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));

    const filter = filterByName && genres.filter(item => item.name === filterByName)[0].name;
    const fRef = filterByName ? collectionsRef.where('genres', 'array-contains', filter) : collectionsRef;

    fRef.orderBy('title', desc ? 'desc' : 'asc').get().then(snap => {
      if (!snap.empty) {
        const collections = [];
        snap.forEach(collection => collection.id !== (denormURL(cid)) && collections.push(collection.data()));
        if (this._isMounted) {
          this.setState({ collections, loadingCollections: false });
        }
      } else if (this._isMounted) {
        this.setState({ collections: null, loadingCollections: false });
      }
    }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
  }

  onFollow = () => {
    const { cid, follow } = this.state;
    const { openSnackbar, user } = this.props;

    if (follow) {
      collectionFollowersRef(denormURL(cid)).doc(user.uid).delete().catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      collectionFollowersRef(denormURL(cid)).doc(user.uid).set({
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: (new Date()).getTime()
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  }

  onToggleDesc = () => {
    if (this._isMounted) this.setState(prevState => ({ desc: !prevState.desc  }));
  }

  onChangeFilterBy = (e, option) => {
    if (this._isMounted) this.setState({ filterByName: option, filterMenuAnchorEl: null });
  }
  onOpenFilterMenu = e => {
    e.persist();
    if (this._isMounted) this.setState({ filterMenuAnchorEl: e.currentTarget });
  }
  onCloseFilterMenu = () => {
    if (this._isMounted) this.setState({ filterMenuAnchorEl: null });
  }
  onResetFilters = () => {
    if (this._isMounted) this.setState({ filterByName: null, filterMenuAnchorEl: null });
  }

  render() {
    const { cid, collection, collections, desc, filterByName, filterMenuAnchorEl, followers, follow, loading, loadingCollections, screenSize } = this.state;
    const { history, location, openSnackbar, user } = this.props;

    const isScrollable = isTouchDevice() || screenSize === 'xs' || screenSize === 'sm';
    
    const isEditor = hasRole(user, 'editor');

    const filterByOptions = genres.map(option => (
      <MenuItem
        key={option.id}
        selected={option.name === filterByName}
        onClick={e => this.onChangeFilterBy(e, option.name)}>
        {option.name}
      </MenuItem>
    ));

    if (!loading && !collection) {
      return <NoMatch title="Collezione non trovata" history={history} location={location} />
    }

    return (
      <div id="CollectionComponent" className="container">
        <Helmet>
          <title>{app.name} | {collection ? collection.title : 'Collezione'}</title>
          <link rel="canonical" href={`${app.url}/collections`} />
          <meta name="description" content={collection && collection.description ? truncateString(collection.description, 155) : app.desc} />
        </Helmet>
        <div className="row">
          <div className="col">
              <div className="card dark collection-profile">
                <h2>{denormURL(cid)}</h2>
                {loading ? <div className="skltn rows" /> : 
                  <>
                    <div className="info-row description">
                      <MinifiableText text={collection.description} maxChars={500} />
                    </div>
                    <div className="info-row">
                      <button 
                        type="button" 
                        className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`} 
                        onClick={this.onFollow} 
                        disabled={!user || !isEditor}>
                        {follow ? 
                          <>
                            <span className="hide-on-hover">{icon.check()} Segui</span>
                            <span className="show-on-hover">Smetti</span>
                          </> 
                        : <span>{icon.plus()} Segui</span> }
                      </button>
                      <div className="counter last inline">
                        <Bubbles limit={3} items={followers} />
                      </div>
                    </div>
                  </>
                }
              </div>
              
              <div className="card dark text-left">
                <div className="head nav" role="navigation">
                  <span className="counter last title">Altre collezioni</span>
                  <div className="pull-right">
                    {filterByName &&
                    <Tooltip title="Resetta i filtri">
                      <button
                        type="button"
                        className="btn icon sm flat rounded counter"
                        onClick={this.onResetFilters}>
                        {icon.close()}
                      </button>
                    </Tooltip>
                    }
                    <button 
                      type="button"
                      className="btn sm flat rounded counter"
                      onClick={this.onOpenFilterMenu}>
                      {filterByName || 'Filtra per genere'}
                    </button>
                    <Menu 
                      className="dropdown-menu"
                      anchorEl={filterMenuAnchorEl} 
                      open={Boolean(filterMenuAnchorEl)} 
                      onClose={this.onCloseFilterMenu}>
                      {filterByOptions}
                    </Menu>
                    <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
                      <button
                        type="button"
                        className={`btn sm icon flat rounded counter ${desc ? 'desc' : 'asc'}`}
                        onClick={this.onToggleDesc}>
                        {icon.arrowDown()}
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div className={`badges table ${isScrollable ? 'scrollable' : 'fullview'} ${filterByName ? 'stacked' : ''}`}>
                  <div className="content">
                    {loadingCollections ? <div className="skltn rows" /> : collections ? collections.map(collection => 
                      <Link 
                        to={`/collection/${normURL(collection.title)}`} 
                        key={normalizeString(collection.title)} 
                        className="badge">
                        {collection.title}{filterByName && <span className="pull-right">{collection.books_num} libri</span>}
                      </Link>
                    ) : (
                      <div className="empty text-center">
                        <div className="counter last">Nessuna collezione</div>
                        <button type="button" className="btn rounded flat" onClick={this.onResetFilters}>Resetta i filtri</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <ul className="nolist inline-items info-row hide-md">
                <li className="counter"><Link to="/collections">Collezioni</Link></li>
                <li className="counter"><Link to="/genres">Generi</Link></li>
                <li className="counter"><Link to="/authors">Autori</Link></li>
              </ul>
          </div>
          <div className="col-md-6">
            <div className="card light">
              <BookCollection cid={denormURL(cid)} openSnackbar={openSnackbar} pagination={false} booksPerRow={1} stacked />
            </div>
          </div>
        </div>
      </div>
    );
  }
}