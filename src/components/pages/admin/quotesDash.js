import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { quoteRef, quotesRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';

export default class QuotesDash extends React.Component {
 	state = {
    user: this.props.user,
    quotes: null,
    count: 0,
    desc: true,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'author', label: 'Autore'}, 
      { type: 'bookTitle', label: 'Libro'}, 
      { type: 'coverURL', label: 'Cover'}, 
      { type: 'created_num', label: 'Data di creazione'}
    ],
    orderByIndex: 0,
    page: 1,
    loading: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

	componentDidMount() { 
    this._isMounted = true; 
    this.fetch();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { count, desc, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const prev = direction === 'prev';
    const baseRef = quotesRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    const paginatedRef = prev ? baseRef.endBefore(lastVisible) : baseRef.startAfter(lastVisible);
    const ref = direction ? paginatedRef : baseRef;
    //console.log('fetching');
    console.log({ lastVisible: lastVisible && lastVisible.data().displayName, page, direction });
    this.setState({ loading: true });

    const fetcher = () => {
      ref.onSnapshot(snap => {
        //console.log(snap);
        if (!snap.empty) {
          const quotes = [];
          snap.forEach(quote => quotes.push(quote.data()));
          console.log({ limit, length: snap.docs.length, rest: limit - snap.docs.length });
          this.setState(prevState => ({
            quotes: quotes,
            lastVisible: snap.docs[snap.docs.length-1],
            loading: false,
            page: direction ? prev ? (page > 1) ? (page - 1) : 1 : ((page * limit) > count) ? page : (page + 1) : 1
          }));
        } else this.setState({ quotes: null, count: 0, loading: false });
      });
    }

    if (!direction) {
      quotesRef.get().then(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ count: fullSnap.docs.length });
          fetcher();
        } else this.setState({ count: 0, page: 1 });
      }).catch(error => console.warn(error));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onOpenLimitMenu = e => this.setState({ limitMenuAnchorEl: e.currentTarget });
  onChangeLimitBy = (e, i) => this.setState({ limitByIndex: i, limitMenuAnchorEl: null, page: 1 });
  onCloseLimitMenu = () => this.setState({ limitMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: id });

  onEdit = id => {
    console.log(`Editing ${id}`);
    this.props.openSnackbar('Modifiche salvate', 'success');
  }

  onLock = (id, state) => {
    if (id) {
      if (state) {
        //console.log(`Locking ${id}`);
        quoteRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Citazione bloccata', 'success');
        }).catch(error => console.warn(error));
      } else {
        //console.log(`Unlocking ${id}`);
        quoteRef(id).update({ edit: true }).then(() => {
          this.props.openSnackbar('Citazione sbloccata', 'success');
        }).catch(error => console.warn(error));
      }
    }
  }

  onDelete = id => {
    console.log(`Deleting ${id}`);
    this.props.openSnackbar('Autore cancellato', 'success');
  }

	render() {
    const { quotes, count, desc, limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const quotesList = (quotes && (quotes.length > 0) &&
      quotes.map((quote) => 
        <li key={quote.qid} className="avatar-row">
          <div className="row">
            <div className="col-auto">
              <div className="mock-cover xs" style={{backgroundImage: `url(${quote.coverURL})`}}></div>
            </div>
            <Link to={`/book/${quote.bid}`} className="col">{quote.bookTitle}</Link>
            <Link to={`/author/${quote.author}`} className="col">{quote.author}</Link>
            <div className="col-5 hide-sm">{quote.quote}</div>
            <div className="col hide-sm monotype"><CopyToClipboard openSnackbar={openSnackbar} text={quote.qid}/></div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{new Date(quote.created_num).toLocaleDateString()}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon green" onClick={e => this.onView(quote.qid)}>{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(quote.qid)}>{icon.pencil()}</button>
              <button className={`btn icon ${quote.edit ? 'secondary' : 'flat' }`} onClick={e => this.onLock(quote.qid, quote.edit)} title={quote.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button className="btn icon red" onClick={e => this.onDelete(quote.qid)}>{icon.close()}</button>
            </div>
          </div>
        </li>
      )
    );

    const orderByOptions = orderBy.map((option, index) => (
      <MenuItem
        key={option.type}
        disabled={index === -1}
        selected={index === orderByIndex}
        onClick={event => this.onChangeOrderBy(event, index)}>
        {option.label}
      </MenuItem>
    ));

    const limitByOptions = limitBy.map((option, index) => (
      <MenuItem
        key={option}
        disabled={index === -1}
        selected={index === limitByIndex}
        onClick={event => this.onChangeLimitBy(event, index)}>
        {option}
      </MenuItem>
    ));

    if (redirectTo) return <Redirect to={`/quote/${redirectTo}`} />

		return (
			<div className="container" id="quotesDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-sm">{`${quotes ? quotes.length : 0} di ${count || 0} citazioni`}</span>
                <button className="btn sm flat counter last" onClick={this.onOpenLimitMenu}>{limitBy[limitByIndex]} <span className="hide-xs">per pagina</span></button>
                <Menu 
                  anchorEl={limitMenuAnchorEl} 
                  open={Boolean(limitMenuAnchorEl)} 
                  onClose={this.onCloseLimitMenu}>
                  {limitByOptions}
                </Menu>
              </div>
              <div className="col-auto">
                <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                <Menu 
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={this.onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
              </div>
            </div>
          </div>
          {loading ? 
            <div className="loader"><CircularProgress /></div> 
          : !quotes ? 
            <div className="empty text-center">Nessuna citazione</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto"><div className="mock-cover xs hidden" title="cover"></div></div>
                  <div className="col">Libro</div>
                  <div className="col">Autore</div>
                  <div className="col-5 hide-sm">Testo</div>
                  <div className="col hide-sm">Qid</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Creato</div>
                </div>
              </li>
              {quotesList}
            </ul>
          }
          {count > limitBy[limitByIndex] &&
            <div className="info-row centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (count / limitBy[limitByIndex]) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
          }
        </div>
			</div>
		);
	}
}