import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Helmet } from 'react-helmet';
import { notesRef, notificationsRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { app, handleFirestoreError, timeSince } from '../../config/shared';
import { funcType } from '../../config/types';
import PaginationControls from '../paginationControls';

export default class Notifications extends React.Component {
  state = {
    count: 0,
    desc: true,
    items: null,
    lastVisible: null,
    limit: 50, // TODO: PAGINATION
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
    if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
      this.fetch();
    }
  }

  fetch = () => {
    const { desc, limit, orderBy, orderByIndex } = this.state;
    const { openSnackbar, user } = this.props;
    const items = [];
    const emptyState = { count: 0, items: null, loading: false, page: 1 };

    notesRef(user.uid).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
      if (!snap.empty) {
        snap.forEach(item => items.push(item.data()));
        if (this._isMounted) {
          this.setState({ items, lastVisible: snap.docs[snap.docs.length-1], loading: false, page: 1 });
        }
        notificationsRef.doc(user.uid).get().then(snap => {
          if (snap.exists) {
            if (this._isMounted) this.setState({ count: snap.data().count });
          }
        }).catch(err => {
          if (this._isMounted) this.setState(emptyState, () => openSnackbar(handleFirestoreError(err), 'error'));
        });
      } else {
        if (this._isMounted) {
          this.setState(emptyState);
        }
      }
    }).catch(err => {
      if (this._isMounted) this.setState(emptyState, () => openSnackbar(handleFirestoreError(err), 'error'));
    });
  }

  fetchNext = () => {
    // TODO
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  render() {
    const { count, desc, items, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page } = this.state;

    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        {option.label}
      </MenuItem>
    ));

    if ((!items || items.length === 0) && loading) {
      return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>; 
    }

    return (
      <div className="container" id="notificationsComponent">
        <Helmet>
          <title>{app.name} | Notifiche</title>
        </Helmet>
        {items ? 
          <div className="card light">
            <div className="shelf">
              <div className="collection hoverable-items">
                <div className="head nav">
                  <div className="row">
                    <div className="col">
                      <span className="counter">{items.length || 0} notific{items.length === 1 ? 'a' : 'he'} {count > items.length ? `di ${count}` : ''}</span>
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
                  {items.map((note, i) => (
                    <MenuItem key={note.nid} style={{animationDelay: `${(i + 1) / 10  }s`}}> 
                      <div className="row">
                        {note.photoURL && <div className="col-auto image"><img src={note.photoURL} className="avatar" alt="avatar" /></div>}
                        <div className="col text">
                          <div dangerouslySetInnerHTML={{__html: note.text}} />
                        </div>
                        <div className="col-auto date">{timeSince(note.created_num)}</div>
                      </div>
                    </MenuItem>
                  ))}
                </div>
              </div>
            </div>
          </div>
        :
          <div className="info-row empty text-center pad-v">
            <p>Non ci sono notifiche</p>
          </div>
        }

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