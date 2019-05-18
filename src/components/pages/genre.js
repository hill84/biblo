import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { booksRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { genres } from '../../config/lists';
import { app, handleFirestoreError, isTouchDevice, normURL, screenSize } from '../../config/shared';
import { funcType } from '../../config/types';
import Cover from '../cover';
import Genres from '../genres';
import PaginationControls from '../paginationControls';

export default class Genre extends React.Component {
  state = {
    count: 0,
    coverview: true,
    desc: true,
    items: null,
    lastVisible: null,
    limit: 28,
    loading: true,
    orderBy: [ 
      { type: 'rating_num', label: 'Valutazione'}, 
      { type: 'title', label: 'Titolo'}
    ],
    orderByIndex: 0,
    orderMenuAnchorEl: null,
    page: 1,
    screenSize: screenSize()
  }

  static propTypes = {
    openSnackbar: funcType.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('resize', this.updateScreenSize);
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.updateScreenSize);
  }

  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    const { gid } = this.props.match.params;
    if (this._isMounted) {
      if (gid !== prevProps.match.params.gid || desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }

  updateScreenSize = () => this.setState({ screenSize: screenSize() });

  fetch = () => {
    const { desc, limit, orderBy, orderByIndex } = this.state;
    const { openSnackbar } = this.props;
    const { gid } = this.props.match.params;
    const ref = booksRef.where('genres', 'array-contains', gid);

    if (gid) {
      ref.get().then(fullSnap => {
        if (!fullSnap.empty) {
          if (this._isMounted) {
            this.setState({ count: fullSnap.docs.length });
          }
          ref.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
            if (!snap.empty) {
              const items = [];
              snap.forEach(item => items.push(item.data()));
              // console.log(items);
              if (this._isMounted) {
                this.setState({ items, lastVisible: snap.docs[snap.docs.length-1], loading: false, page: 1 });
              }
            } else {
              if (this._isMounted) {
                this.setState({ items: null, count: 0, loading: false, page: 1 });
              }
            }
          }).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));
        } else {
          if (this._isMounted) {
            this.setState({ items: null, count: 0, loading: false, page: 1 });
          }
        }
      }).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));
    } else console.warn(`No gid`);
  }

  fetchNext = () => {
    const { desc, items, lastVisible, limit, orderBy, orderByIndex } = this.state;
    const { openSnackbar } = this.props;
    const { gid } = this.props.match.params;
    const ref = booksRef.where('genres', 'array-contains', gid);

    if (gid) {
      this.setState({ loading: true });
      ref.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
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
    } else console.warn(`No gid`);
  }

  onChangeOrderBy = (e, i) => {
    this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  render() {
    const { count, coverview, desc, items, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, screenSize } = this.state;
    const { match } = this.props;

    const covers = items && items.map((item, i) => <Link key={item.bid} to={`/book/${item.bid}/${normURL(item.title)}`}><Cover book={item} index={i} page={page} /></Link>);

    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        {option.label}
      </MenuItem>
    ));

    const genreColor = genres.filter(genre => genre.name === match.params.gid)[0].color;

    const isScrollable = isTouchDevice() || screenSize === 'xs' || screenSize === 'sm';

    if ((!items || items.length === 0) && loading) {
      return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>; 
    }

    const seo = {
      canonical_name: genres.filter(genre => genre.name === match.params.gid)[0].canonical,
      description: `Scopri su ${app.name} i libri di genere ${match.params.gid}`,
      image: null,
      title: match.params.gid,
      url: `${app.url}/genre/${match.params.gid}`
    };

    return (
      <div className="container" id="genreComponent">
        <Helmet>
          <title>{app.name} | {match.params.gid || 'Genere'}</title>
          <meta name="description" content={seo.description} />
          <meta property="og:type" content="books.genre" />
          <meta property="og:title" content={seo.title} />
          <meta property="og:url" content={seo.url} />
          {seo.image && <meta property="og:image" content={seo.image} />}
          <meta property="books:canonical_name" content={seo.canonical_name} />
        </Helmet>
        <div className="card dark" style={{ backgroundColor: !isScrollable ? genreColor : null }}>
          <div className="row">
            <div className="col">
              <h2 className="title"><span className="primary-text hide-sm">Genere:</span> {match.params.gid}</h2>
            </div>
            <div className="col-auto text-right">
              <Link to="/genres" className="btn sm flat" style={{color: !isScrollable ? 'white' : ''}}>Generi</Link>
            </div>
          </div>
          <Genres scrollable={isScrollable} />
        </div>

        {items ? 
          <div className="card light">
            <div className="shelf">
              <div className="collection hoverable-items">
                <div className="head nav">
                  <div className="row">
                    <div className="col">
                      <button 
                        type="button"
                        className="btn sm flat counter"
                        title={coverview ? 'Stack view' : 'Cover view'} 
                        onClick={this.onToggleView}>
                        {coverview ? icon.viewSequential() : icon.viewGrid()}
                      </button>
                      <span className="counter">{items.length || 0} libr{items.length === 1 ? 'o' : 'i'} {count > items.length ? `di ${count}` : ''}</span>
                    </div>
                    <div className="col-auto">
                      <button type="button" className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                      <button type="button" className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                      <Menu 
                        className="dropdown-menu"
                        anchorEl={orderMenuAnchorEl} 
                        open={Boolean(orderMenuAnchorEl)} 
                        onClose={this.onCloseOrderMenu}>
                        {orderByOptions}
                      </Menu>
                    </div>
                  </div>
                </div>
                <div className={`shelf-row books-per-row-4 ${coverview ? 'coverview' : 'stacked'}`}>
                  {covers}
                </div>
              </div>
            </div>
          </div>
        :
          <div className="info-row empty text-center pad-v">
            <p>Non ci sono ancora libri di questo genere</p>
            <Link to="/new-book?search=genre" className="btn primary">Aggiungi libro</Link>
          </div>
        }

        {count > 0 && items && items.length < count &&
          <PaginationControls 
            count={count} 
            fetch={this.fetchNext} 
            limit={limit}
            loading={loading}
            oneWay
            page={page}
          />
        }

      </div>
    );
  }
};