import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { usersRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { getInitials } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';

export default class UsersDash extends React.Component {
 	state = {
    user: this.props.user,
    users: null,
    count: 0,
    desc: true,
    limit: 15,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'creationTime', label: 'Data'}, 
      { type: 'displayName', label: 'Nome'}, 
      { type: 'uid', label: 'uid'}, 
      { type: 'email', label: 'Email'},
      { type: 'stats.shelf_num', label: 'Libri'},
      { type: 'stats.wishlist_num', label: 'Desideri'},
      { type: 'stats.reviews_num', label: 'Recensioni'},
      { type: 'stats.ratings_num', label: 'Voti'}
    ],
    orderByIndex: 0,
    page: 1,
    loading: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

  /* static getDerivedStateFromProps(props, state) {
    return null;
  } */ 

	componentDidMount() { 
    this._isMounted = true; 
    this.fetch();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { desc, limit, orderBy, orderByIndex, page } = this.state;
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const uRef = usersRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching users');
    this.setState({ loading: true });
    
    usersRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ count: fullSnap.docs.length });
        let lastVisible = fullSnap.docs[startAt];
        //console.log({lastVisible, limit, direction, page});
        const ref = direction ? uRef.startAt(lastVisible) : uRef;
        ref.get().then(snap => {
          //console.log(snap);
          if (!snap.empty) {
            const users = [];
            snap.forEach(user => users.push({ ...user.data() }));
            this.setState(prevState => ({
              users: users,
              loading: false,
              page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.count) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ users: null, loading: false });
        });
      } else this.setState({ count: 0 });
    });
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onView = id => this.setState({ redirectTo: id });

  onEdit = id => {
    console.log(`Editing ${id}`);
    this.props.openSnackbar('Modifiche salvate', 'success');
  }

  onLock = id => {
    console.log(`Locking ${id}`);
    this.props.openSnackbar('Utente bloccato', 'success');
  }

  onDelete = id => {
    console.log(`Deleting ${id}`);
    this.props.openSnackbar('Utente cancellato', 'success');
  }

	render() {
    const { count, desc, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo, users } = this.state;
    const { openSnackbar } = this.props;

    const usersList = (users && (users.length > 0) &&
      users.map((user) => 
        <li key={user.uid} className="avatar-row">
          <div className="row">
            <div className="col-auto hide-xs">
              <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
            </div>
            <div className="col hide-sm" title={user.displayName}>{user.displayName}</div>
            <div className="col monotype" title={user.uid}>
              <CopyToClipboard openSnackbar={openSnackbar} text={user.uid}/>
            </div>
            <div className="col monotype hide-sm" title={user.email}>
              <CopyToClipboard openSnackbar={openSnackbar} text={user.email}/>
            </div>
            <div className="col col-sm-3 col-lg-2">
              <div className="row text-center">
                <div className="col">{user.stats.shelf_num}</div>
                <div className="col">{user.stats.wishlist_num}</div>
                <div className="col">{user.stats.reviews_num}</div>
                <div className="col">{user.stats.ratings_num}</div>
              </div>
            </div>
            <div className="col col-sm-3 col-lg-2 btns xs">
              <div className={`btn ${user.roles.editor ? 'selected' : 'flat'}`} title="editor">E</div>
              <div className={`btn ${user.roles.premium ? 'selected' : 'flat'}`} title="premium">P</div>
              <div className={`btn ${user.roles.admin ? 'selected' : 'flat'}`} title="admin">A</div>
            </div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{new Date(user.creationTime).toLocaleDateString()}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon success" onClick={e => this.onView(user.uid)} title="anteprima">{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(user.uid)} title="modifica">{icon.pencil()}</button>
              <button className="btn icon secondary" onClick={e => this.onLock(user.uid)} title="blocca">{icon.lock()}</button>
              <button className="btn icon error" onClick={e => this.onDelete(user.uid)} title="elimina">{icon.close()}</button>
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

    if (redirectTo) return <Redirect to={`/dashboard/${redirectTo}`} />

		return (
			<div className="container" id="usersDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${users ? users.length : 0} di ${count || 0} utenti`}</span>
              </div>
              <div className="col-auto">
                <span className="counter last hide-xs">Ordina per</span>
                <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}>{orderBy[orderByIndex].label}</button>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                <Popover 
                  open={Boolean(orderMenuAnchorEl)}
                  onClose={this.onCloseOrderMenu} 
                  anchorEl={orderMenuAnchorEl} 
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  transformOrigin={{horizontal: 'right', vertical: 'top'}}>
                  <Menu 
                    anchorEl={orderMenuAnchorEl} 
                    open={Boolean(orderMenuAnchorEl)} 
                    onClose={this.onCloseOrderMenu}>
                    {orderByOptions}
                  </Menu>
                </Popover>
              </div>
            </div>
          </div>
          {loading ? 
            <div className="loader"><CircularProgress /></div> 
          : !users ? 
            <div className="empty text-center">Nessun utente</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto hide-xs"><div className="avatar" title="avatar"></div></div>
                  <div className="col hide-sm">Nominativo</div>
                  <div className="col">Uid</div>
                  <div className="col hide-sm">Email</div>
                  <div className="col col-sm-3 col-lg-2">
                    <div className="row text-center">
                      <div className="col" title="Libri">{icon.book()}</div>
                      <div className="col" title="Desideri">{icon.heart()}</div>
                      <div className="col" title="Recensioni">{icon.review()}</div>
                      <div className="col" title="Voti">{icon.star()}</div>
                    </div>
                  </div>
                  <div className="col col-sm-3 col-lg-2">Ruoli</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Creato</div>
                </div>
              </li>
              {usersList}
            </ul>
          }
          {count > limit &&
            <div className="info-row centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetch('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (count / limit) && 'disabled'} 
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