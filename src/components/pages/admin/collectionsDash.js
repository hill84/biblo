import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import Link from 'react-router-dom/Link';
import Redirect from 'react-router-dom/Redirect';
import { collectionRef, collectionsRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
import { timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';

export default class collectionsDash extends React.Component {
 	state = {
    user: this.props.user,
    collections: null,
    count: 0,
    desc: true,
    lastVisible: null,
    limitMenuAnchorEl: null,
    limitBy: [ 15, 25, 50, 100, 250, 500],
    limitByIndex: 0,
    orderMenuAnchorEl: null,
    orderBy: [ 
      { type: 'title', label: 'Titolo'}
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
    const { desc, limitByIndex, orderByIndex } = this.state;
    if (this._isMounted) {
      if (desc !== prevState.desc || limitByIndex !== prevState.limitByIndex || orderByIndex !== prevState.orderByIndex) {
        this.fetch();
      }
    }
  }
    
  fetch = direction => {
    const { desc, lastVisible, limitBy, limitByIndex, orderBy, orderByIndex, page } = this.state;
    const limit = limitBy[limitByIndex];
    const startAt = direction ? (direction === 'prev') ? ((page - 1) * limit) - limit : page * limit : 0;
    const cRef = collectionsRef.orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc').limit(limit);
    //console.log('fetching collections');
    this.setState({ loading: true });
    
    collectionsRef.get().then(fullSnap => {
      //console.log(fullSnap);
      if (!fullSnap.empty) {
        this.setState({ count: fullSnap.docs.length, lastVisible: fullSnap.docs[startAt] });
        console.log({startAt, lastVisible_id: lastVisible ? lastVisible.id : fullSnap.docs[startAt].id, limit, direction, page});
        const ref = direction ? cRef.startAt(lastVisible || fullSnap.docs[startAt]) : cRef;
        ref.onSnapshot(snap => {
          console.log(snap);
          if (!snap.empty) {
            const collections = [];
            snap.forEach(collection => collections.push({ ...collection.data() }));
            this.setState(prevState => ({
              collections: collections,
              lastVisible: snap.docs[startAt],
              loading: false,
              page: direction ? (direction === 'prev') ? prevState.page - 1 : ((prevState.page * limit) > prevState.usersCount) ? prevState.page : prevState.page + 1 : 1
            }));
          } else this.setState({ collections: null, lastVisible: null, loading: false });
        });
      } else this.setState({ count: 0 });
    }).catch(error => console.warn(error));
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
    if (id) {
      //console.log(`Editing ${id}`);
      //TODO
      this.setState({ redirectTo: id }); 
    }
  }

  onLock = (id, state) => {
    if (id) {
      if (state) {
        console.log(`Locking ${id}`);
        collectionRef(id).update({ edit: false }).then(() => {
          this.props.openSnackbar('Collezione bloccata', 'success');
        }).catch(error => console.warn(error));
      } else {
        console.log(`Unlocking ${id}`);
        collectionRef(id).update({ edit: true }).then(() => {
          this.props.openSnackbar('Collezione sbloccata', 'success');
        }).catch(error => console.warn(error));
      }
    }
  }

  onDelete = id => {
    if (id) {
      //console.log(`Deleting ${id}`);
      //TODO
      this.props.openSnackbar('Collezione cancellata', 'success');
    }
  }

	render() {
    const { collections, count, desc,  limitBy, limitByIndex, limitMenuAnchorEl, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, redirectTo } = this.state;
    const { openSnackbar } = this.props;

    const collectionsList = (collections && (collections.length > 0) &&
      collections.map((collection) => 
        <li key={collection.title} className="avatar-row">
          <div className="row">
            <Link to={`/collection/${collection.title}`} className="col">
              {collection.title}
            </Link>
            <div className="col">{collection.books_num}</div>
            <div className="col col-sm-2 col-lg-1 text-right">
              <div className="timestamp">{timeSince(collection.lastEdit_num)}</div>
            </div>
            <div className="absolute-row right btns xs">
              <button className="btn icon green" onClick={e => this.onView(collection.title)} title="Anteprima">{icon.eye()}</button>
              <button className="btn icon primary" onClick={e => this.onEdit(collection.title)} title="Modifica">{icon.pencil()}</button>
              <button className={`btn icon ${collection.edit ? 'secondary' : 'flat' }`} onClick={e => this.onLock(collection.title, collection.edit)} title={collection.edit ? 'Blocca' : 'Sblocca'}>{icon.lock()}</button>
              <button className="btn icon red" onClick={e => this.onDelete(collection.title)}>{icon.close()}</button>
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

    if (redirectTo) return <Redirect to={`/collection/${redirectTo}`} />

		return (
			<div className="container" id="collectionsDashComponent">
        <div className="card dark" style={{ minHeight: 200 }}>
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="counter hide-md">{`${collections ? collections.length : 0} di ${count || 0} collezioni`}</span>
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
                <Menu 
                  anchorEl={orderMenuAnchorEl} 
                  open={Boolean(orderMenuAnchorEl)} 
                  onClose={this.onCloseOrderMenu}>
                  {orderByOptions}
                </Menu>
                <button className={`btn sm flat counter ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
              </div>
            </div>
          </div>
          {loading ? 
            <div className="loader"><CircularProgress /></div> 
          : !collections ? 
            <div className="empty text-center">Nessuna collezione</div>
          :
            <ul className="table dense nolist font-sm">
              <li className="labels">
                <div className="row">
                  <div className="col">Titolo</div>
                  <div className="col">Libri</div>
                  <div className="col col-sm-2 col-lg-1 text-right">Modificata</div>
                </div>
              </li>
              {collectionsList}
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