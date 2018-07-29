import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { usersRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { getInitials } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';

export default class Users extends React.Component {
 	state = {
    user: this.props.user,
    users: null,
    usersCount: 0,
    desc: true,
    limit: 50,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'creationTime', label: 'Data'}, 
      { type: 'displayName', label: 'Nome'}, 
      { type: 'uid', label: 'uid'}, 
      { type: 'email', label: 'Email'}
    ],
    orderByIndex: 0,
    page: 1,
    loadingUsers: true
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

 static getDerivedStateFromProps(props, state) {
    return null;
  } 

	componentDidMount() { 
    this._isMounted = true; 
    this.fetchUsers();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetchUsers();
      }
    }
  }
    
  fetchUsers = direction => {
    const { desc, limit, orderBy, orderByIndex, page } = this.state;
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const uRef = usersRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching user');
    this.setState({ loadingUsers: true });
    
    usersRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ usersCount: fullSnap.docs.length });
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
              loadingUsers: false,
              page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ users: null, loadingUsers: false });
        });
      } else this.setState({ usersCount: 0 });
    });
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

	render() {
    const { desc, limit, loadingUsers, orderBy, orderByIndex, orderMenuAnchorEl, page, users, usersCount } = this.state;
    const { openSnackbar } = this.props;

    const usersList = (users && (users.length > 0) &&
      users.map((user) => 
        <li key={user.uid} className="avatar-row">
          <div className="row ripple">
            <Link to={`/dashboard/${user.uid}`} className="col-auto hide-xs">
              <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
            </Link>
            <div className="col hide-sm" title={user.displayName}>{user.displayName}</div>
            <div className="col monotype" title={user.uid}><small><CopyToClipboard openSnackbar={openSnackbar} text={user.uid}/></small></div>
            <div className="col monotype hide-sm" title={user.email}><small><CopyToClipboard openSnackbar={openSnackbar} text={user.email}/></small></div>
            <div className="col col-sm-2 col-lg-1 btns xs">
              <div className={`btn prepend ${user.roles.editor ? 'selected' : 'clear'}`} title="editor">E</div>
              <div className={`btn pend ${user.roles.premium ? 'selected' : 'clear'}`} title="premium">P</div>
              <div className={`btn append ${user.roles.admin ? 'selected' : 'clear'}`} title="admin">A</div>
            </div>
            <div className="col-1 btns xs">
              <div className="btn error" title="cancella">✕</div>
            </div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{new Date(user.creationTime).toLocaleDateString()}</div>
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

		return (
			<div className="container" id="usersComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${users ? users.length : 0} di ${usersCount || 0} utenti`}</span>
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
          {loadingUsers ? 
            <div className="loader"><CircularProgress /></div> 
          : !users ? 
            <div className="empty text-center">Nessun utente</div>
          :
            <ul className="table dense nolist">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto hide-xs"><div className="avatar" title="avatar"></div></div>
                  <div className="col hide-sm">displayName</div>
                  <div className="col">uid</div>
                  <div className="col hide-sm">email</div>
                  <div className="col col-sm-2 col-lg-1">ruoli</div>
                  <div className="col-1">actions</div>
                  <div className="col col-sm-2 col-lg-1 text-right">creationTime</div>
                </div>
              </li>
              {usersList}
            </ul>
          }
          {usersCount > limit &&
            <div className="info-row footer centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchUsers('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (usersCount / limit) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchUsers('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
          }
        </div>
			</div>
		);
	}
}