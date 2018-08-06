import React from 'react';
import Link from 'react-router-dom/Link';
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
    collectionCount: 0,
    desc: false,
    loading: true,
    page: null,
    lastVisible: null
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
    this._isMounted = true;
    this.fetchCollection();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { bcid, cid, desc } = this.state;
    if (this._isMounted) {
      if (bcid !== prevState.bcid || cid !== prevState.cid || desc !== prevState.desc) {
        this.fetchCollection();
      }
    }
  }

  fetchCollection = () => {
    const { bcid, cid, desc, limit } = this.state;
    //console.log(limit);
    collectionBooksRef(cid).get().then(snap => {
      if (!snap.empty) { 
        this.setState({ collectionCount: snap.docs.length });
        let books = [];
        collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title').limit(limit).get().then(snap => {
          snap.forEach(book => books.push(book.data()));
          this.setState({ 
            collection: books,
            loading: false,
            page: 1,
            //lastVisible: snap.docs[snap.docs.length-1]
          });
        }).catch(error => console.warn("Error fetching collection:", error));
      } else {
        this.setState({ 
          collectionCount: 0, 
          collection: null,
          loading: false,
          page: null,
          //lastVisible: null 
        });
      }
    });
  }
  
	fetch = direction => {
    const { bcid, cid, collectionCount, desc, /* firstVisible, lastVisible,  */limit, page } = this.state;
    //console.log({'direction': direction, 'firstVisible': firstVisible, 'lastVisible': lastVisible.id});
    //const startAfter = (direction === 'prev') ? firstVisible : lastVisible;
    const startAfter = (direction === 'prev') ? (page > 1) ? ((page - 1) * limit) - limit : 0 : ((page * limit) > collectionCount) ? ((page - 1) * limit) : page * limit;

    this.setState({ loading: true });
    
    let nextBooks = [];
		collectionBooksRef(cid).orderBy(bcid, desc ? 'desc' : 'asc').orderBy('publication').orderBy('title').startAfter(startAfter).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(book => nextBooks.push(book.data()));
        this.setState(prevState => ({ 
          collection: nextBooks,
          loading: false,
          page: (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.collectionCount) ? prevState.page : prevState.page + 1,
          //lastVisible: nextSnap.docs[nextSnap.docs.length-1] || prevState.lastVisible
        }));
        //console.log(nextBooks);
        //console.log({'direction': direction, 'page': page});
      } else {
        this.setState({ 
          collection: [],
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
		}).catch(error => console.warn("Error fetching next page:", error));
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

	render() {
		const { booksPerRow, cid, collection, collectionCount, desc, limit, loading, page, pagination, scrollable, stacked } = this.state;
    const covers = (collection && (collection.length > 0) ?
      <div className={`shelf-row books-per-row-${booksPerRow} ${stacked ? 'stacked' : 'abreast'}`}>
        {collection.map((book, index) => 
          <Link key={book.bid} to={`/book/${book.bid}`}>
            <Cover book={book} rating={true} full={stacked} index={index} />
          </Link>
        )}
      </div>
    : 
      <div className="info-row empty">Non ci sono libri in questa collezione.</div>
    );

		return (
      <React.Fragment>
        <div className="head nav" role="navigation">
          <span className="counter last title">{cid}</span> {collectionCount !== 0 && <span className="count hide-xs">({collectionCount} libri)</span>} 
          {!loading && collectionCount > 0 &&
            <div className="pull-right">
              {(pagination && collectionCount > limit) || scrollable ?
                <Link to={`/collection/${cid}`} className="btn sm flat counter">Vedi tutti</Link>
              :
                <React.Fragment>
                  <span className="counter last hide-xs">Ordina per</span>
                  <button 
                    className="btn sm icon flat counter"
                    onClick={() => this.orderBy('rating')}
                    title="Ordina per valutazione">
                    {icon.star()}
                  </button>
                  <button 
                    className={`btn sm icon flat counter ${desc ? 'desc' : 'asc'}`} 
                    title={desc ? 'Ascendente' : 'Discendente'} 
                    onClick={this.onToggleDesc}>
                    {icon.arrowDown()}
                  </button>
                </React.Fragment>
              }
              {pagination && collectionCount > limit &&
                <React.Fragment>
                  <button 
                    disabled={page < 2 && 'disabled'} 
                    className="btn sm clear prepend" 
                    onClick={() => this.fetch('prev')} title="precedente">
                    {icon.chevronLeft()}
                  </button>
                  <button 
                    disabled={page > (collectionCount / limit) && 'disabled'} 
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