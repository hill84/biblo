import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Link } from 'react-router-dom';
import { authorsRef, countRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { getInitials, handleFirestoreError } from '../../config/shared';
import { numberType, funcType } from '../../config/types';
import PaginationControls from '../paginationControls';

export default class AuthorsPage extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: true,
    lastVisible: null,
    limit: this.props.limit || 27,
    loading: true,
    orderBy: [ 
      { type: 'photoURL', label: 'Foto' },
      { type: 'displayName', label: 'Nominativo' }, 
      { type: 'lastEdit_num', label: 'Data ultima modifica' }, 
      { type: 'sex', label: 'Sesso' }
    ],
    orderByIndex: 0,
    page: 1
  }

  static propTypes = {
    limit: numberType,
    openSnackbar: funcType.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }

  fetch = e => { 
    const { openSnackbar } = this.props;
    const { desc, firstVisible, lastVisible, limit, orderBy, orderByIndex } = this.state;
    const direction = e && e.currentTarget.dataset.direction;
    const prev = direction === 'prev';
    const ref = authorsRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef = ref.startAfter(prev ? firstVisible : lastVisible);
    const dRef = direction ? paginatedRef : ref;

    if (this._isMounted) {
      this.setState({ loading: true });
    }

    const fetcher = () => {
      dRef.get().then(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          if (this._isMounted) {
            this.setState(prevState => ({ 
              firstVisible: snap.docs[prev ? snap.size -1 : 0],
              items: prev ? items.reverse() : items,
              lastVisible: snap.docs[prev ? 0 : snap.size -1],
              loading: false,
              page: direction ? prev ? prevState.page - 1 : ((prevState.page * limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1
            }));
          }
        } else {
          if (this._isMounted) {
            this.setState({ firstVisible: null, items: null, lastVisible: null, loading: false, page: 1 });
          }
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }

    if (!direction) {
      countRef('authors').get().then(fullSnap => {
        if (fullSnap.exists) {
          if (this._isMounted) {
            this.setState({ count: fullSnap.data().count }, () => fetcher());
          }
        } else if (this._isMounted) {
          this.setState({ count: 0 });
        }
      }).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else fetcher();
  }

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });
  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });
	
	render() {
    const { count, desc, items, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page } = this.state;

    if (loading) return <div aria-hidden="true" className="loader"><CircularProgress /></div> 
    
    const orderByOptions = orderBy.map((option, index) => (
      <MenuItem
        key={option.type}
        disabled={index === -1}
        selected={index === orderByIndex}
        onClick={event => this.onChangeOrderBy(event, index)}>
        {option.label}
      </MenuItem>
    ));

		return (
      <div className="container" id="authorsComponent">
        <div className="card dark">
          {loading ? <div aria-hidden="true" className="loader"><CircularProgress /></div> : !items ? <div className="empty text-center">Nessun elemento</div> :
            <React.Fragment>
              <div className="head nav" role="navigation">
                <div className="row">
                  <div className="col">
                    <span className="counter last title primary-text">Autori</span> {count !== 0 && <span className="count hide-xs">({count})</span>} 
                  </div>
                  <div className="col-auto">
                    <button type="button" className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                    <button type="button" className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
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

              <div className={`bubbles boxed shelf-row avatars-row ${loading ? 'skltns-row' : 'hoverable-items'}`}>
                {items.map((item, index) => 
                  <Link to={`/author/${item.displayName}`} key={item.displayName} style={{animationDelay: `${index/15}s`}} className="bubble">
                    <Avatar className="avatar centered" src={item.photoURL} alt={item.displayName}>
                      {!item.photoURL && getInitials(item.displayName)}
                    </Avatar>
                    <div className="title">{item.displayName}</div>
                  </Link>
                )}
              </div>
              
              <PaginationControls 
                count={count} 
                fetch={this.fetch}
                limit={limit}
                loading={loading}
                // oneWay
                page={page}
              />
            </React.Fragment>
          }
        </div>
      </div>
		);
	}
}