import AppBar from '@material-ui/core/AppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import { userRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { app, screenSize } from '../../../config/shared';
import { funcType, historyType, matchType, userType } from '../../../config/types';
import AuthorForm from '../../forms/authorForm';
import CollectionForm from '../../forms/collectionForm';
import NoteForm from '../../forms/noteForm';
import QuoteForm from '../../forms/quoteForm';
import AuthorsDash from './authorsDash';
import BooksDash from './booksDash';
import CollectionsDash from './collectionsDash';
import NotesDash from './notesDash';
import QuotesDash from './quotesDash';
import UsersDash from './usersDash';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
const tabs = [
  { name: 'users', label: 'Utenti', icon: icon.account() },
  { name: 'books', label: 'Libri', icon: icon.book() },
  { name: 'authors', label: 'Autori', icon: icon.accountEdit() },
  { name: 'collections', label: 'Collezioni', icon: icon.viewCarousel() },
  { name: 'quotes', label: 'Citazioni', icon: icon.quote() },
  { name: 'notifications', label: 'Notifiche', icon: icon.bell() },
];

export default class Admin extends Component {
 	state = {
    isAdmin: false,
    aid: this.props.user && this.props.user.uid,
    openSnackbar: this.props.openSnackbar,
    user: null,
    loadingUser: true,
    selectedEl: null,
    selectedId: null,
    tabSelected: this.props.match.params.tab ? (tabs.find(tab => tab.name === this.props.match.params.tab) || 0) : 0,
    isOpenAuthorDialog: false,
    isOpenCollectionDialog: false,
    isOpenNoteDialog: false,
    isOpenQuoteDialog: false,
    screenSize: screenSize()
	}

	static propTypes = {
    history: historyType,
    match: matchType,
    openSnackbar: funcType.isRequired,
    user: userType
  }

  static defaultProps = {
    history: null,
    match: null,
    user: null
  }

  static getDerivedStateFromProps(props, state) {
    const tabSelected = tabs.find(tab => tab.name === props.match.params.tab);
    if (tabSelected && tabSelected !== state.tabSelected) {
      const tabSelectedIndex = tabs.findIndex(tab => tab.name === props.match.params.tab);
      return { tabSelected: tabSelectedIndex };
    }
    if (props.user) {
      if (props.user.uid !== state.aid) { 
        return { aid: props.user.uid }; 
      }
    }
    return null;
  } 

	componentDidMount() { 
    this._isMounted = true;
    if (this.state.aid) this.fetchUser();
    if (this.state.tabSelected === 0) this.props.history.replace(`/admin/${tabs[0].name}`, null);
    window.addEventListener('resize', this.updateScreenSize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.aid !== prevState.aid) {
      this.fetchUser();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubUserFetch && this.unsubUserFetch();
    window.removeEventListener('resize', this.updateScreenSize);
  }
  
  updateScreenSize = () => this.setState({ screenSize: screenSize() });
    
  fetchUser = () => {
		const { aid } = this.state;
    // console.log('fetching user');
    this.unsubUserFetch = userRef(aid).onSnapshot(snap => {
      if (snap.exists) {
        this.setState({
          isAdmin: snap.data().roles.admin,
          user: snap.data(),
          loadingUser: false
        });
      } else {
        this.setState({ isAdmin: false, user: null, loadingUser: false });
      }
    });
  }

  onTabSelect = (e, value) => {
    if (value !== -1) {
      if (this._isMounted) {
        this.setState({ tabSelected: value }, () => {
          this.historyPushTabIndex(value);
        });
      }
    }
  };

  onTabSelectIndex = index => {
    if (index !== -1) {
      if (this._isMounted) {
        this.setState({ tabSelected: index }, () => {
          this.historyPushTabIndex(index);
        });
      }
    }
  }

  historyPushTabIndex = index => {
    const newPath = `/admin/${tabs[index].name}`;
    if (this.props.history !== newPath) {
      this.props.history.push(newPath, null);
    }
  }

  son = id => id ? typeof id === 'string' ? id : typeof id === 'number' ? String(id) : null : null;

  onToggleAuthorDialog = id => this.setState(prevState => ({ isOpenAuthorDialog: !prevState.isOpenAuthorDialog, selectedId: this.son(id) }));
  onToggleCollectionDialog = id => this.setState(prevState => ({ isOpenCollectionDialog: !prevState.isOpenCollectionDialog, selectedId: this.son(id) }));
  onToggleNoteDialog = (id, el) => this.setState(prevState => ({ isOpenNoteDialog: !prevState.isOpenNoteDialog, selectedId: this.son(id), selectedEl: this.son(el) }));
  onToggleQuoteDialog = id => this.setState(prevState => ({ isOpenQuoteDialog: !prevState.isOpenQuoteDialog, selectedId: this.son(id) }));

	render() {
		const { isAdmin, isOpenAuthorDialog, isOpenCollectionDialog, isOpenNoteDialog, isOpenQuoteDialog, loadingUser, openSnackbar, screenSize, selectedEl, selectedId, tabDir, tabSelected, user } = this.state;

		if (loadingUser) {
      return <div aria-hidden="true" className="loader"><CircularProgress /></div>
    } else if (!isAdmin) {
      return (
        <div className="container empty" id="adminComponent">
          <div className="card dark empty text-center">
            <p>{icon.cancel()}</p>
            <p>Area riservata agli amministratori</p>
          </div>
        </div>
      );
    }

		return (
			<div className="container" id="adminComponent">
        <Helmet>
          <title>{app.name} | Amministrazione</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="actions btns text-center pad-v-sm">
          <button type="button" title="Crea libro" className="btn rounded primary">
            <Link to="/new-book"><span className="hide-sm">{icon.plus()} libro</span><span className="show-sm">{icon.book()}</span></Link>
          </button>
          <button type="button" onClick={this.onToggleAuthorDialog} title="Crea autore" className="btn rounded primary">
            <span className="hide-sm">{icon.plus()} autore</span><span className="show-sm">{icon.accountEdit()}</span>
          </button>
          <button type="button" onClick={this.onToggleCollectionDialog} title="Crea collezione" className="btn rounded primary">
            <span className="hide-sm">{icon.plus()} collezione</span><span className="show-sm">{icon.viewCarousel()}</span>
          </button>
          <button type="button" onClick={this.onToggleQuoteDialog} title="Crea citazione" className="btn rounded primary">
            <span className="hide-sm">{icon.plus()} citazione</span><span className="show-sm">{icon.quote()}</span>
          </button>
          {/* <button type="button" onClick={this.onToggleNoteDialog} title="Crea notifica" className="btn rounded primary">
            <span className="hide-sm">{icon.plus()} notifica</span><span className="show-sm">{icon.bell()}</span>
          </button> */}
        </div>
        <AppBar position="static" className="appbar flat">
          <Tabs 
            value={tabSelected}
            onChange={this.onTabSelect}
            variant={screenSize === 'sm' ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto">
            {tabs.map(tab => (
              <Tab key={tab.name} label={<><span className="show-md">{tab.icon}</span><span className="hide-md">{tab.label}</span></>} />
            ))}
          </Tabs>
        </AppBar>
        <BindKeyboardSwipeableViews
          enableMouseEvents
          resistance
          className="tabs-container"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.onTabSelectIndex}>
          <div className="card dark" dir={tabDir}>
            <UsersDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleNoteDialog} inView={tabSelected === 0} />
          </div>
          <div className="card dark" dir={tabDir}>
            <BooksDash user={user} openSnackbar={openSnackbar} inView={tabSelected === 1} />
          </div>
          <div className="card dark" dir={tabDir}>
            <AuthorsDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleAuthorDialog} inView={tabSelected === 2} />
          </div>
          <div className="card dark" dir={tabDir}>
            <CollectionsDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleCollectionDialog} inView={tabSelected === 3} />
          </div>
          <div className="card dark" dir={tabDir}>
            <QuotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleQuoteDialog} inView={tabSelected === 4} />
          </div>
          <div className="card dark" dir={tabDir}>
            <NotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleNoteDialog} inView={tabSelected === 5} />
          </div>
        </BindKeyboardSwipeableViews>

        {isOpenAuthorDialog && <AuthorForm id={selectedId} onToggle={this.onToggleAuthorDialog} user={user} openSnackbar={openSnackbar} />}
        {isOpenCollectionDialog && <CollectionForm id={selectedId} onToggle={this.onToggleCollectionDialog} user={user} openSnackbar={openSnackbar} />}
        {isOpenNoteDialog && <NoteForm uid={selectedId} nid={selectedEl} onToggle={this.onToggleNoteDialog} user={user} openSnackbar={openSnackbar} />}
        {isOpenQuoteDialog && <QuoteForm id={selectedId} onToggle={this.onToggleQuoteDialog} user={user} openSnackbar={openSnackbar} />}
			</div>
		);
	}
}