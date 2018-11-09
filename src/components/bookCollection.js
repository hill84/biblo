import React from 'react';
import { Link } from 'react-router-dom';
import { collectionBooksRef } from '../config/firebase';
import { icon } from '../config/icons';
import { booksPerRow /* , isTouchDevice */ } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class BookCollection extends React.Component {
	state = {
    cid: this.props.cid || 'top',
    bcid: this.props.bcid || 'bcid',
    booksPerRow: this.props.booksPerRow || 1,
    limit:  this.props.limit || (this.props.pagination ? booksPerRow() : 98),
    scrollable: /* isTouchDevice() ? ( */this.props.scrollable || false/* ) : false */,
    pagination: /* isTouchDevice() ? ( */this.props.pagination || false/* ) : true */,
    stacked: this.props.stacked || false,
    collection: [],
    count: 0,
    desc: false,
    loading: true,
    page: null,
    // lastVisible: null
  }

  static propTypes = {
    cid: stringType.isRequired,
    bcid: stringType,
    booksPerRow: numberType,
    limit: numberType,
    pagination: boolType,
    scrollable: boolType,
    stacked: boolType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.cid !== state.cid) { return { cid: props.cid || 'top' }; }
    if (props.bcid !== state.bcid) { return { bcid: props.bcid || 'bcid' }; }
    if (props.booksPerRow !== state.booksPerRow) { return { booksPerRow: props.booksPerRow || 1 }; }
    if (props.limit !== state.limit) { return { limit: props.limit || (props.pagination ? booksPerRow() : 98) }; }
    if (props.pagination !== state.pagination) { return { pagination: props.pagination || false }; }
    if (props.scrollable !== state.scrollable) { return { scrollable: props.scrollable || false }; }
    if (props.stacked !== state.stacked) { return { stacked: props.stacked || false }; }
    return null;
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bcid, cid, desc } = this.state;
    if (bcid !== prevState.bcid || cid !== prevState.cid || desc !== prevState.desc) {
      this.fetch();
    }
  }
  
	fetch = direction => {
    const { bcid, cid, count, desc, /* firstVisible, lastVisible,  */limit, page } = this.state;
    // console.log({'direction': direction, 'firstVisible': firstVisible, 'lastVisible': lastVisible.id});
    const prev = direction === 'prev';
    // const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter = prev ? page > 1 ? (page - 1) * limit - limit : 0 : ((page * limit) > count) ? (page - 1) * limit : page * limit;
    const baseRef = collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title').limit(limit);
    const paginatedRef = baseRef.startAfter(startAfter);
    const ref = direction ? paginatedRef : baseRef;
    
    this.setState({ loading: true });

    const fetcher = () => {
      ref.get().then(snap => {
        if (!snap.empty) {
          const books = [];
          snap.forEach(book => books.push(book.data()));
          this.setState(prevState => ({ 
            collection: books,
            loading: false,
            page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1,
            // lastVisible: snap.docs[snap.docs.length-1] || prevState.lastVisible
          }));
          // console.log(books);
          // console.log({'direction': direction, 'page': page});
        } else {
          this.setState({ 
            count: 0,
            collection: [],
            loading: false,
            page: null,
            // lastVisible: null
          });
        }
      }).catch(error => console.warn(error));
    }

    if (!direction) {
      collectionBooksRef(cid).get().then(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ count: fullSnap.docs.length });
          fetcher();
        }
      }).catch(error => console.warn(error));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

	render() {
		const { booksPerRow, cid, collection, count, desc, limit, loading, page, pagination, scrollable, stacked } = this.state;
    const covers = (collection && collection.length ?
      <div className={`shelf-row books-per-row-${booksPerRow} ${stacked ? 'stacked' : 'abreast'}`}>
        {collection.map((book, i) => 
          <Link key={book.bid} to={`/book/${book.bid}`}>
            <Cover book={book} rating full={stacked} index={i} bcid={book.bcid} />
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
                <Link to={`/collection/${cid}`} className="btn sm flat counter">Vedi tutti</Link>
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
                    className="btn sm clear prepend" 
                    onClick={() => this.fetch('prev')} title="precedente">
                    {icon.chevronLeft()}
                  </button>
                  <button 
                    type="button"
                    disabled={page > (count / limit) && 'disabled'} 
                    className="btn sm clear append" 
                    onClick={() => this.fetch('next')} title="successivo">
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