import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { authorsRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { getInitials } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import CopyToClipboard from '../../copyToClipboard';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';

export default class AuthorsDash extends React.Component {
 	state = {
    user: this.props.user,
    authors: null,
    authorsCount: 0,
    desc: true,
    limit: 50,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'created_num', label: 'Data'}, 
      { type: 'displayName', label: 'Nome'}, 
      { type: 'sex', label: 'Sesso'}
    ],
    orderByIndex: 0,
    page: 1,
    loadingAuthors: true
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
    this.fetchAuthors();
  }

	componentWillUnmount() { this._isMounted = false; }
  
  componentDidUpdate(prevProps, prevState) {
    const { desc, limit, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limit !== prevState.limit || orderByIndex !== prevState.orderByIndex) {
        this.fetchAuthors();
      }
    }
  }
    
  fetchAuthors = direction => {
    const { desc, limit, orderBy, orderByIndex, page } = this.state;
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const aRef = authorsRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching authors');
    this.setState({ loadingAuthors: true });
    
    authorsRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ authorsCount: fullSnap.docs.length });
        let lastVisible = fullSnap.docs[startAt];
        //console.log({lastVisible, limit, direction, page});
        const ref = direction ? aRef.startAt(lastVisible) : aRef;
        ref.get().then(snap => {
          //console.log(snap);
          if (!snap.empty) {
            const authors = [];
            snap.forEach(author => authors.push({ ...author.data() }));
            this.setState(prevState => ({
              authors: authors,
              loadingAuthors: false,
              page: direction ? (direction === 'prev') ? (prevState.page > 1) ? prevState.page - 1 : 1 : ((prevState.page * prevState.limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ authors: null, loadingAuthors: false });
        });
      } else this.setState({ authorsCount: 0 });
    });
  }

  onChangeOrderBy = (e, i) => this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  onEdit = () => {
    console.log('Editing..');
    this.props.openSnackbar('Modifiche salvate', 'success');
  }

  onDelete = () => {
    console.log('Deleting..');
    this.props.openSnackbar('Autore cancellato', 'success');
  }

	render() {
    const { desc, limit, loadingAuthors, orderBy, orderByIndex, orderMenuAnchorEl, page, authors, authorsCount } = this.state;
    const { openSnackbar } = this.props;

    const authorsList = (authors && (authors.length > 0) &&
      authors.map((author) => 
        <li key={author.displayName} className="avatar-row">
          <div className="row ripple">
            <Link to={`/author/${author.displayName}`} className="col-auto hide-xs">
              <Avatar className="avatar" src={author.photoURL} alt={author.displayName}>{!author.photoURL && getInitials(author.displayName)}</Avatar>
            </Link>
            <div className="col-2" title={author.displayName}><CopyToClipboard openSnackbar={openSnackbar} text={author.displayName}/></div>
            <div className="col-1 btns xs">
              <div className="btn flat" title={author.sex === 'm' ? 'uomo' : 'donna'}>{author.sex}</div>
            </div>
            <div className="col hide-sm" title={author.bio}><small>{author.bio}</small></div>
            <div className="col-1 btns xs">
              <div className="btn icon primary" title="modifica" onClick={this.onEdit}>{icon.pencil()}</div>
              <div className="btn icon error" title="cancella" onClick={this.onDelete}>{icon.close()}</div>
            </div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{new Date(author.created_num).toLocaleDateString()}</div>
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
			<div className="container" id="authorsDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${authors ? authors.length : 0} di ${authorsCount || 0} autori`}</span>
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
          {loadingAuthors ? 
            <div className="loader"><CircularProgress /></div> 
          : !authors ? 
            <div className="empty text-center">Nessun autore</div>
          :
            <ul className="table dense nolist">
              <li className="avatar-row labels">
                <div className="row">
                  <div className="col-auto hide-xs"><div className="avatar" title="avatar"></div></div>
                  <div className="col-2">displayName</div>
                  <div className="col-1">sesso</div>
                  <div className="col hide-sm">bio</div>
                  <div className="col-1">azioni</div>
                  <div className="col col-sm-2 col-lg-1 text-right">created_num</div>
                </div>
              </li>
              {authorsList}
            </ul>
          }
          {authorsCount > limit &&
            <div className="info-row footer centered pagination">
              <button 
                disabled={page === 1 && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchAuthors('prev')} title="precedente">
                {icon.chevronLeft()}
              </button>

              <button 
                disabled={page > (authorsCount / limit) && 'disabled'} 
                className="btn flat" 
                onClick={() => this.fetchAuthors('next')} title="successivo">
                {icon.chevronRight()}
              </button>
            </div>
          }
        </div>
			</div>
		);
	}
}