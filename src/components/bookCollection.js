import React from 'react';
import Link from 'react-router-dom/Link';
import { collectionsRef } from '../config/firebase';
import { icon } from '../config/icons';
/* import { isTouchDevice } from '../config/shared'; */
import { boolType, numberType, stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class BookCollection extends React.Component {
	state = {
    cid: this.props.cid || 'top',
    bcid: this.props.bcid || 'bcid',
    limit: this.props.limit || (this.props.pagination || this.props.scrollable) ? 7 : 98,
    scrollable: /* isTouchDevice() ? ( */this.props.scrollable || false/* ) : false */,
    pagination: /* isTouchDevice() ? ( */this.props.pagination || false/* ) : true */,
    stacked: this.props.stacked || false,
    collection: null,
    collectionCount: 0,
    desc: false,
    loading: true,
    page: null,
    lastVisible: null
  }

  static propTypes = {
    cid: stringType.isRequired,
    bcid: stringType,
    limit: numberType,
    pagination: boolType,
    scrollable: boolType,
    stacked: boolType
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.cid !== prevState.cid) { return { cid: nextProps.cid || 'top' }; }
    if (nextProps.bcid !== prevState.bcid) { return { bcid: nextProps.bcid || 'bcid' }; }
    if (nextProps.limit !== prevState.limit) { return { limit: nextProps.limit || (this.state.pagination || this.state.scrollable) ? 7 : 98 }; }
    if (nextProps.pagination !== prevState.pagination) { return { pagination: nextProps.pagination || false }; }
    if (nextProps.scrollable !== prevState.scrollable) { return { scrollable: nextProps.scrollable || false }; }
    if (nextProps.stacked !== prevState.stacked) { return { stacked: nextProps.stacked || false }; }
    return null;
  }

  componentDidMount() {
    this.fetchCollection(this.state.cid, this.state.bcid, this.state.limit);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.cid !== prevState.cid || this.state.bcid !== prevState.bcid || this.state.limit !== prevState.limit || this.state.desc !== prevState.desc) {
      console.log('Fetching collection');
      this.fetchCollection(this.state.cid, this.state.bcid, this.state.limit);
    }
  }

  fetchCollection = (cid, bcid, limit) => {
    let books = [];
    collectionsRef(cid).get().then(snap => {
      if (!snap.empty) { 
        this.setState({ collectionCount: snap.docs.length });
      } else {
        this.setState({ collectionCount: 0 });
      }
    });
    collectionsRef(cid).orderBy(String(bcid), this.state.desc ? 'desc' : 'asc').orderBy('publication').orderBy('title').limit(Number(limit)).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(book => books.push(book.data()));
        this.setState({ 
          collection: books,
          loading: false,
          page: 1,
          //lastVisible: snap.docs[snap.docs.length-1]
        });
        //console.log(books);
      } else {
        this.setState({ 
          collection: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
    }).catch(error => console.warn("Error fetching collection:", error));
  }
  
	fetch = direction => {
    //console.log({'direction': direction, 'firstVisible': this.state.firstVisible, 'lastVisible': this.state.lastVisible.id});
    //const startAfter = (direction === 'prev') ? this.state.firstVisible : this.state.lastVisible;
    const startAfter = (direction === 'prev') ? (this.state.page > 1) ? ((this.state.page - 1) * this.state.limit) - this.state.limit : 0 : ((this.state.page * this.state.limit) > this.state.collectionCount) ? ((this.state.page - 1) * this.state.limit) : this.state.page * this.state.limit;

    this.setState({ loading: true });
    
    let nextBooks = [];
		collectionsRef(this.state.cid).orderBy(String(this.state.bcid), this.state.desc ? 'desc' : 'asc').orderBy('publication').orderBy('title').startAfter(startAfter).limit(this.state.limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(book => nextBooks.push(book.data()));
        this.setState(prevState => ({ 
          collection: nextBooks,
          loading: false,
          page: (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.collectionCount) ? prevState.page : prevState.page + 1,
          //lastVisible: nextSnap.docs[nextSnap.docs.length-1] || prevState.lastVisible
        }));
        //console.log(nextBooks);
        //console.log({'direction': direction, 'page': this.state.page});
      } else {
        this.setState({ 
          collection: null,
          loading: false,
          page: null,
          //lastVisible: null
        });
      }
		}).catch(error => console.warn("Error fetching next collection:", error));
  }

  onToggleDesc = () => {
    console.log('Toggle desc');
    this.setState(prevState => ({ desc: !prevState.desc }));
  }

	render() {
		const { cid, collection, collectionCount, desc, limit, loading, page, pagination, scrollable, stacked } = this.state;
    const covers = (collection && (collection.length > 0) ?
      <div className={`shelf-row ${stacked ? 'stacked' : 'abreast'}`}>
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
          <span className="counter last collection-title">{cid}</span> {collectionCount !== 0 && <span className="collection-count hide-xs">({collectionCount} libri)</span>}
          <div className="pull-right">
            {(pagination && collectionCount > limit) || scrollable ?
              <Link to={`/collection/${cid}`} className="btn sm flat counter">Vedi tutti</Link>
            :
              <React.Fragment>
                <span className="counter last hide-xs">Ordina per</span>
                <button 
                  className="btn sm flat counter"
                  onClick={() => this.orderBy('rating')}
                  title="Ordina per valutazione">
                  {icon.star()}
                </button>
                <button 
                  className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} 
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
        </div>

        <div className={`shelf collection hoverable-items ${scrollable ? 'scrollable' : ''}`}>
          {loading ? stacked ? skltn_shelfStack : skltn_shelfRow : covers}
        </div>
      </React.Fragment>
		)
	}
}