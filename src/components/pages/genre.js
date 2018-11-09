import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Link } from 'react-router-dom';
import { booksRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import Cover from '../cover';
import Genres from '../genres';

export default class Genre extends React.Component {
  state = {
    books: null,
    coverview: false,
    desc: true,
    limit: 24,
    loading: true,
    orderBy: [ 
      { type: 'rating_num', label: 'Valutazione'}, 
      { type: 'title', label: 'Titolo'}
    ],
    orderByIndex: 0,
    orderMenuAnchorEl: null,
    page: 1
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { desc, orderByIndex } = this.state;
    if(this.props.match.params.gid !== prevProps.match.params.gid || desc !== prevState.desc || orderByIndex !== prevState.orderByIndex){
      this.fetch();
    }
  }

  fetch = () => {
    const { desc, limit, orderBy, orderByIndex } = this.state;
    const { gid } = this.props.match.params;
    if (gid) {
      booksRef.where('genres', 'array-contains', gid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
        if (!snap.empty) {
          const books = [];
          snap.forEach(book => books.push(book.data()));
          // console.log(books);
          this.setState({ books, loading: false });
        } else {
          this.setState({ books: null, loading: false });
        }
      }).catch(error => console.warn(error));
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
    const { books, coverview, desc, loading, orderBy, orderByIndex, orderMenuAnchorEl } = this.state;

    const covers = books && books.map((book, i) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={i} /></Link>);

    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        {option.label}
      </MenuItem>
    ));

    if (loading) return <div aria-hidden="true" className="loader"><CircularProgress /></div>

    return (
      <div className="container" id="genreComponent">
        <div className="card dark">
          <h2 className="title"><span className="primary-text">Genere:</span> {this.props.match.params.gid}</h2>
          <Genres />
        </div>

        {books ? 
          <div className="card">
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
                      <span className="counter">{books.length || 0} libr{books.length === 1 ? 'o' : 'i'}</span>
                    </div>
                    <div className="col-auto">
                      <button type="button" className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                      <button type="button" className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                      <Menu 
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
            <Link to="/new-book" className="btn primary">Aggiungi libro</Link>
          </div>
        }

      </div>
    );
  }
};