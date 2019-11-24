import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { notesRef, notificationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, handleFirestoreError } from '../../config/shared';
import { funcType, userType } from '../../config/types';
import NoteMenuItem from '../noteMenuItem';
import PaginationControls from '../paginationControls';

export default class Notifications extends Component {
  state = {
    count: 0,
    desc: true,
    items: null,
    lastVisible: null,
    limit: 10,
    loading: true,
    orderBy: [ 
      { type: 'created_num', label: 'Data'}, 
      { type: 'read', label: 'Lettura'},
      { type: 'createdByUid', label: 'Mittente'}
    ],
    orderByIndex: 0,
    orderMenuAnchorEl: null,
    page: 1
  }

  static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
  }

  static defaultProps = {
    user: null
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
      this.fetch();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetch = () => {
    const { desc, limit, orderBy, orderByIndex } = this.state;
    const { openSnackbar, user } = this.props;
    const emptyState = { count: 0, items: null, loading: false, page: 1 };
    const items = [];
    const ref = notesRef(user.uid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');

    if (this._isMounted) {
      this.setState({ loading: true });
    }

    ref.limit(limit).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => items.push(item.data()));
        if (this._isMounted) {
          this.setState({ items, lastVisible: snap.docs[snap.docs.length-1], loading: false, page: 1 });
        }
        notificationsRef.doc(user.uid).get().then(snap => {
          if (snap.exists) {
            if (this._isMounted) {
              this.setState({ count: snap.data().count });
            }
          }
        }).catch(err => {
          if (this._isMounted) {
            this.setState(emptyState, () => openSnackbar(handleFirestoreError(err), 'error'));
          }
        });
      } else if (this._isMounted) {
        this.setState(emptyState);
      }
    }).catch(err => {
      if (this._isMounted) {
        this.setState(emptyState, () => openSnackbar(handleFirestoreError(err), 'error'));
      }
    });
  }

  fetchNext = () => {
    const { desc, items, lastVisible, limit, orderBy, orderByIndex } = this.state;
    const { openSnackbar, user } = this.props;
    const ref = notesRef(user.uid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');

    if (this._isMounted) {
      this.setState({ loading: true });
    }

    ref.startAfter(lastVisible).limit(limit).get().then(nextSnap => {
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
      } else if (this._isMounted) {
        this.setState({ 
          items: null,
          loading: false,
          page: null,
          lastVisible: null
        });
      }
    }).catch(err => this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error')));
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  render() {
    const { count, desc, items, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page } = this.state;
    const skeletons = [...Array(limit)].map((e, i) => <div key={i} className="skltn notification" />);
    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        {option.label}
      </MenuItem>
    ));

    if (!items && !loading) { 
      return (
        <div className="reviews">
          <div className="info-row empty text-center pad-v">
            <p>Non ci sono notifiche</p>
          </div>
        </div>
      );
    } 

    return (
      <div className="container" id="notificationsComponent">
        <Helmet>
          <title>{app.name} | Notifiche</title>
          <link rel="canonical" href={app.url} />
        </Helmet>
         
        <div className="card light">
          <div className="collection hoverable-items">
            <div className="head nav">
              <div className="row">
                <div className="col">
                  <span className="counter">{items ? items.length : 0} notific{items && items.length === 1 ? 'a' : 'he'} {items && count > items.length ? `di ${count}` : ''}</span>
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
            <div className="shelf notes">
              {items && items.map(item => <NoteMenuItem item={item} key={item.nid} animation={false} />)}
              {loading && skeletons}
            </div>
          </div>
        </div>

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