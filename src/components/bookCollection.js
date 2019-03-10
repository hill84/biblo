import React from 'react';
import { Link } from 'react-router-dom';
import { booksRef, collectionBooksRef } from '../config/firebase';
import { icon } from '../config/icons';
import { genres } from '../config/lists';
import { appName, booksPerRow, handleFirestoreError /* , isTouchDevice */ } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class BookCollection extends React.Component {
	state = {
    cid: this.props.cid,
    bcid: this.props.bcid || 'bcid',
    booksPerRow: this.props.booksPerRow || 1,
    limit:  this.props.limit || (this.props.pagination ? booksPerRow() : 98),
    scrollable: /* isTouchDevice() ? ( */this.props.scrollable || false/* ) : false */,
    pagination: /* isTouchDevice() ? ( */this.props.pagination || false/* ) : true */,
    stacked: this.props.stacked || false,
    collection: [],
    count: 0,
    desc: this.props.desc || false,
    loading: true,
    page: null,
    // lastVisible: null
  }

  static propTypes = {
    cid: stringType.isRequired,
    bcid: stringType,
    booksPerRow: numberType,
    desc: boolType,
    inView: boolType,
    limit: numberType,
    pagination: boolType,
    scrollable: boolType,
    stacked: boolType
  }

  static defaultProps = {
    inView: true
  }

  static getDerivedStateFromProps(props, state) {
    if (props.cid !== state.cid) { return { cid: props.cid }; }
    if (props.bcid !== state.bcid) { return { bcid: props.bcid || 'bcid' }; }
    if (props.booksPerRow !== state.booksPerRow) { return { booksPerRow: props.booksPerRow || 1 }; }
    if (props.desc !== state.desc) { return { desc: props.desc || false }; }
    if (props.limit !== state.limit) { return { limit: props.limit || (props.pagination ? booksPerRow() : 98) }; }
    if (props.pagination !== state.pagination) { return { pagination: props.pagination || false }; }
    if (props.scrollable !== state.scrollable) { return { scrollable: props.scrollable || false }; }
    if (props.stacked !== state.stacked) { return { stacked: props.stacked || false }; }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }
  
  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { inView } = this.props;
    const { bcid, cid, desc } = this.state;
    if (this._isMounted) {
      if (bcid !== prevState.bcid || cid !== prevState.cid || desc !== prevState.desc || inView !== prevProps.inView) {
        this.fetch();
      }
    }
  }
  
	fetch = e => {
    const { inView, openSnackbar } = this.props;
    const { bcid, cid, count, desc, /* firstVisible, lastVisible,  */limit, page } = this.state;
    const direction = e && e.currentTarget.dataset.direction;
    // console.log(direction, /* firstVisible, lastVisible.id */);
    const prev = direction === 'prev';
    // const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter = prev ? page > 1 ? (page - 1) * limit - limit : 0 : ((page * limit) > count) ? (page - 1) * limit : page * limit;
    const isGenre = genres.some(item => item.name === cid);
    const baseRef = cid === 'Top' ? 
      booksRef.orderBy('readers_num', 'desc') : isGenre ? 
      booksRef.where('genres', 'array-contains', cid).orderBy('rating_num', desc ? 'desc' : 'asc') : 
      collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title');
    const lRef = baseRef.limit(limit);
    const paginatedRef = lRef.startAfter(startAfter);
    const ref = direction ? paginatedRef : lRef;
    
    if (this._isMounted) {
      this.setState({ loading: true });
    }

    if (inView) {
      const fetcher = () => {
        ref.get().then(snap => {
          if (!snap.empty) {
            const books = [];
            snap.forEach(book => books.push(book.data()));
            if (this._isMounted) {
              this.setState(prevState => ({ 
                collection: books,
                loading: false,
                page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1,
                // lastVisible: snap.docs[snap.docs.length-1] || prevState.lastVisible
              }));
            }
            // console.log({'direction': direction, 'page': page});
          } else {
            if (this._isMounted) {
              this.setState({ 
                count: 0,
                collection: [],
                loading: false,
                page: null,
                // lastVisible: null
              });
            }
          }
        }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
      }
    
      if (cid === 'Top') {
        this.setState({ count: limit }, () => fetcher());
      } else {
        if (!direction) {
          collectionBooksRef(cid).get().then(fullSnap => {
            if (!fullSnap.empty) { 
              if (this._isMounted) {
                this.setState({ count: fullSnap.docs.length }, () => fetcher());
              }
            }
          }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
        } else fetcher();
      }
    }
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

	render() {
		const { booksPerRow, cid, collection, count, desc, limit, loading, page, pagination, scrollable, stacked } = this.state;
    const covers = (collection && collection.length ?
      <div className={`shelf-row books-per-row-${booksPerRow} ${stacked ? 'stacked' : 'abreast'}`}>
        {collection.map((book, i) => 
          <Link key={book.bid} to={`/book/${book.bid}`}>
            <Cover book={book} rating full={stacked} index={i} bcid={book.bcid} showReaders={cid === 'Top'} />
          </Link>
        )}
      </div>
    : 
      <div className="info-row empty">Non ci sono libri in questa collezione.</div>
    );

		return (
      <React.Fragment>
        <div className="head nav" role="navigation">
          <span className="counter last title"><span className="primary-text hide-sm">Collezione:</span> {cid}</span> {count !== 0 && <span className="count hide-xs">({count} libri)</span>} 
          {!loading && count > 0 &&
            <div className="pull-right">
              {(pagination && count > limit) || scrollable ?
                cid === 'Top' ? `I ${limit} libri più letti su ${appName}` : <button className="btn sm flat counter"><Link to={`/collection/${cid}`}>Vedi tutti</Link></button>
              :
                <button 
                  type="button"
                  className={`btn sm icon flat counter ${desc ? 'desc' : 'asc'}`} 
                  title={desc ? 'Ascendente' : 'Discendente'} 
                  onClick={this.onToggleDesc}>
                  {icon.arrowDown()}
                </button>
              }
              {pagination && count > limit &&
                <React.Fragment>
                  <button 
                    type="button"
                    disabled={page < 2 && 'disabled'} 
                    className="btn sm flat icon rounded" 
                    data-direction="prev"
                    onClick={this.fetch} title="precedente">
                    {icon.chevronLeft()}
                  </button>
                  <button 
                    type="button"
                    disabled={page > (count / limit) && 'disabled'} 
                    className="btn sm flat icon rounded" 
                    data-direction="next"
                    onClick={this.fetch} title="successivo">
                    {icon.chevronRight()}
                  </button>
                </React.Fragment>
              }
            </div>
          }
        </div>

        <div className={`shelf collection hoverable-items ${scrollable ? 'scrollable' : ''}`}>
          {loading ? stacked ? skltn_shelfStack : skltn_shelfRow : covers}
        </div>
      </React.Fragment>
		)
	}
}