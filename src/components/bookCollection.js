import React from 'react';
import { collectionsRef } from '../config/firebase';
import { boolType, numberType, stringType } from '../config/types';
import { Link } from 'react-router-dom';
import { skltn_shelfRow } from './skeletons';
import Cover from './cover';

export default class BookCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      cid: this.props.cid || 'Harry Potter',
      bcid: this.props.bcid || 'creationTime',
      limit: this.props.limit || 7,
      scrollable: this.props.scrollable || false,
      pagination: this.props.pagination || false,
			collection: null,
      loading: true,
			lastVisible: null
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.cid !== this.props.cid) {
      this.setState({ cid: nextProps.cid });
      this.fetchCollection(nextProps.cid);
    }
  }

	componentDidMount(props) {
    this.fetchCollection(this.state.cid, this.state.bcid, this.state.limit);
  }

  fetchCollection = (cid, bcid, limit) => {
    let books = [];
    collectionsRef(cid).orderBy(String(bcid)).limit(Number(limit)).get().then(snap => {
      console.log(snap.docs);
      snap.forEach(book => books.push(book.data()));
      this.setState({ 
        collection: books,
        loading: false,
        lastVisible: snap.docs[snap.docs.length-1]
      });
      //console.log(books);
    }).catch(error => console.warn("Error fetching collection:", error));
  }
  
	fetch = e => direction => {
    //console.log(`fetch ${direction}`);
    let startAfter = /* (direction === 'prev') ? 1 : */ this.state.lastVisible;
    
    this.setState({ loading: true });
    
    let nextBooks = [];
    console.log({'nextBooks': nextBooks});
		collectionsRef(this.state.cid).orderBy(this.state.bcid).startAfter(startAfter).limit(this.state.limit).get().then(nextSnap => {
      console.log({'nextBooks': nextBooks});
      nextSnap.forEach(book => nextBooks.push(book.data()));
			this.setState({ 
				collection: nextBooks,
        loading: false,
				lastVisible: nextSnap.docs[nextSnap.docs.length-1]
			});
			console.log(nextBooks);
		}).catch(error => console.warn("Error fetching next collection:", error));
  }

	render() {
		const { cid, collection, loading, pagination, scrollable } = this.state;
		let covers = collection && collection.map(book => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} rating={true} /></Link> );

		return (
      <div className={`shelf collection hoverable-items ${scrollable ? 'scrollable' : ''}`}>    
        <div className="info-row">
          <strong className="pull-left collection-title">{cid}</strong>
          <span className="pull-right">
            {pagination ?
              <span>
                <button className="btn sm flat" onClick={this.fetch('prev')}>Prev</button>
                <button className="btn sm flat" onClick={this.fetch('next')}>Next</button>
              </span>
            :
              <button className="btn sm flat">Vedi tutti</button>
            }
          </span>
        </div>
        {loading ? skltn_shelfRow :
          <div className="shelf-row">
            {covers}
          </div>
        }
      </div>	
		)
	}
}

BookCollection.propTypes = {
  cid: stringType.isRequired,
  bcid: stringType,
  limit: numberType,
  pagination: boolType,
  scrollable: boolType
}