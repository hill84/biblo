import React from 'react';
import { collectionsRef } from '../config/firebase';
import { boolType, numberType, stringType } from '../config/types';
import { icon } from '../config/icons';
import { Link } from 'react-router-dom';
import { skltn_shelfRow } from './skeletons';
import Cover from './cover';

export default class BookCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      cid: this.props.cid || 'top',
      bcid: this.props.bcid || 'bcid',
      limit: this.props.limit || (this.props.pagination || this.props.scrollable) ? 7 : 98,
      scrollable: this.props.scrollable || false,
      pagination: this.props.pagination || false,
      stacked: this.props.stacked || false,
      collection: null,
      collectionCount: 0,
      loading: true,
      page: null,
			lastVisible: null
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.cid !== this.props.cid || nextProps.bcid !== this.props.bcid || nextProps.limit !== this.props.limit) {
      this.setState({ cid: nextProps.cid });
      this.fetchCollection(nextProps.cid, nextProps.bcid, nextProps.limit);
    }
  }

	componentDidMount(props) {
    this.fetchCollection(this.state.cid, this.state.bcid, this.state.limit);
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
    collectionsRef(cid).orderBy(String(bcid)).orderBy('publication').orderBy('title').limit(Number(limit)).get().then(snap => {
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
		collectionsRef(this.state.cid).orderBy(String(this.state.bcid)).orderBy('publication').orderBy('title').startAfter(startAfter).limit(this.state.limit).get().then(nextSnap => {
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

	render() {
		const { cid, collection, collectionCount, limit, loading, page, pagination, scrollable, stacked } = this.state;
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
      <div className={`shelf collection hoverable-items ${scrollable ? 'scrollable' : ''}`}>    
        <div className="info-row">
          <strong className="collection-title">{cid}</strong> <span className="collection-count">({collectionCount} libri)</span>
          <span className="pull-right">
            {pagination && collectionCount > limit ?
              <span role="navigation">
                <button 
                  disabled={page < 2 && 'disabled'} 
                  className="btn sm clear prepend" 
                  onClick={() => this.fetch('prev')} title="precedente">{icon.chevronLeft()}</button>
                <button 
                  disabled={page > (collectionCount / limit) && 'disabled'} 
                  className="btn sm clear append" 
                  onClick={() => this.fetch('next')} title="successivo">{icon.chevronRight()}</button>
              </span>
            :
              scrollable ? 
                <Link to={`/collection/${cid}`} className="btn sm flat">Vedi tutti</Link> 
              : 
                <div className="btns">
                  <button 
                    className="btn sm clear prepend"
                    onClick={() => this.orderBy('rating')}
                    title="Ordina per voto">{icon.star()}</button>
                  <button 
                    className="btn sm clear pend"
                    onClick={() => this.orderBy('ascending')}
                    title="Ordina ascendente">{icon.sortAscending()}</button>
                  <button 
                    className="btn sm clear append"
                    onClick={() => this.orderBy('descending')}
                    title="Ordina discendente">{icon.sortDescending()}</button>
                </div>
            }
          </span>
        </div>
        {loading ? skltn_shelfRow : covers}
      </div>	
		)
	}
}

BookCollection.propTypes = {
  cid: stringType.isRequired,
  bcid: stringType,
  limit: numberType,
  pagination: boolType,
  scrollable: boolType,
  stacked: boolType
}