import AppBar from '@material-ui/core/AppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import Link from 'react-router-dom/Link';
import SwipeableViews from 'react-swipeable-views';
import { userRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
//import { appName, calcAge, getInitials, joinToLowerCase, timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';
import NewFeature from '../../newFeature';
import AuthorsDash from './authorsDash';
import BooksDash from './booksDash';
import CollectionsDash from './collectionsDash';
import QuotesDash from './quotesDash';
import UsersDash from './usersDash';
/* import NewAuthor from '../../forms/newAuthor';
import NewCollection from '../../forms/newCollection';
import NewNote from '../../forms/newNote'; */
import NewQuote from '../../forms/newQuote';

const tabs = ['users', 'books', 'authors', 'collections', 'quotes', 'notifications'];

export default class Admin extends React.Component {
 	state = {
    isAdmin: false,
    aid: this.props.user && this.props.user.uid,
    openSnackbar: this.props.openSnackbar,
    user: null,
    loadingUser: true,
    tabSelected: this.props.match.params.tab ? tabs.indexOf(this.props.match.params.tab) !== -1 ? tabs.indexOf(this.props.match.params.tab) : 0 : 0,
    isOpenAuthorDialog: false,
    isOpenCollectionDialog: false,
    isOpenNoteDialog: false,
    isOpenQuoteDialog: false
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

 static getDerivedStateFromProps(props, state) {
    if (tabs.indexOf(props.match.params.tab) !== -1) {
      if (tabs.indexOf(props.match.params.tab) !== state.tabSelected) {
        return { tabSelected: tabs.indexOf(props.match.params.tab) };
      }
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
    if (this.state.tabSelected === 0) this.props.history.push(`/admin/${tabs[0]}`, null);
  }

	componentWillUnmount() { this._isMounted = false; }

  componentDidUpdate(prevProps, prevState) {
		if (this._isMounted) {
      if (this.state.aid !== prevState.aid) {
        this.fetchUser();
      }
		}
	}
    
  fetchUser = () => {
		const { aid } = this.state;
    //console.log('fetching user');
    userRef(aid).onSnapshot(snap => {
      if (snap.exists) {
        this.setState({
          isAdmin: snap.data().roles.admin,
          user: snap.data(),
          loadingUser: false
        });
      } else this.setState({ isAdmin: false, user: null, loadingUser: false });
    });
  }
  
  onTabSelect = (e, value) => {
    if (value !== -1) this.props.history.push(`/admin/${tabs[value]}`, null);
    this.setState({ tabSelected: value });
  }

  onTabSelectIndex = index => this.setState({ tabSelected: index });

  onToggleQuoteDialog = () => this.setState(prevState => ({ isOpenQuoteDialog: !prevState.isOpenQuoteDialog })); 

	render() {
		const { isAdmin, /* isOpenAuthorDialog, isOpenCollectionDialog, isOpenNoteDialog,  */isOpenQuoteDialog, loadingUser, openSnackbar, tabDir, tabSelected, user } = this.state;

		if (loadingUser) {
      return <div className="loader"><CircularProgress /></div>
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
        <div className="actions btns text-center pad-v-sm">
          <button title="Crea libro" className="btn primary"><Link to="/new-book">{icon.plus()} libro</Link></button>
          <button onClick={this.onToggleAuthorDialog} title="Crea autore" className="btn primary disabled">{icon.plus()} autore</button>
          <button onClick={this.onToggleCollectionDialog} title="Crea collezione" className="btn primary disabled">{icon.plus()} collezione</button>
          <button onClick={this.onToggleQuoteDialog} title="Crea citazione" className="btn primary">{icon.plus()} citazione</button>
          <button onClick={this.onToggleNoteDialog} title="Crea notifica" className="btn primary disabled">{icon.plus()} Notifica</button>
        </div>
        <AppBar position="static" className="appbar flat">
          <Tabs 
            value={tabSelected}
            onChange={this.onTabSelect}
            fullWidth
            scrollable
            scrollButtons="auto">
            <Tab label="Utenti" />
            <Tab label="Libri" />
            <Tab label="Autori" />
            <Tab label="Collezioni" />
            <Tab label="Citazioni" />
            <Tab label="Notifiche" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          className="tabs-container"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.onTabSelectIndex}>
          <React.Fragment>
            {tabSelected === 0 && <div className="tab" dir={tabDir}>
              <UsersDash user={user} openSnackbar={openSnackbar} />
            </div>}
          </React.Fragment>
          <React.Fragment>
            {tabSelected === 1 && <div className="tab" dir={tabDir}>
              <BooksDash user={user} openSnackbar={openSnackbar} />
            </div>}
          </React.Fragment>
          <React.Fragment>
            {tabSelected === 2 && <div className="tab" dir={tabDir}>
              <AuthorsDash user={user} openSnackbar={openSnackbar} />
            </div>}
          </React.Fragment>
          <React.Fragment>
            {tabSelected === 3 && <div className="tab" dir={tabDir}>
              <CollectionsDash user={user} openSnackbar={openSnackbar} />
            </div>}
          </React.Fragment>
          <React.Fragment>
            {tabSelected === 4 && <div className="tab" dir={tabDir}>
              <QuotesDash user={user} openSnackbar={openSnackbar} />
            </div>}
          </React.Fragment>
          <React.Fragment>
            {tabSelected === 5 && <div className="tab card dark" dir={tabDir}>
              <NewFeature />
            </div>}
          </React.Fragment>
        </SwipeableViews>

        {/* isOpenAuthorDialog && <NewAuthor onToggle={this.onToggleAuthorDialog} user={user} openSnackbar={openSnackbar} /> */}
        {/* isOpenCollectionDialog && <NewCollection onToggle={this.onToggleCollectionDialog} user={user} openSnackbar={openSnackbar} /> */}
        {/* isOpenNoteDialog && <NewNote onToggle={this.onToggleNoteDialog} user={user} openSnackbar={openSnackbar} /> */}
        {isOpenQuoteDialog && <NewQuote onToggle={this.onToggleQuoteDialog} user={user} openSnackbar={openSnackbar} />}
			</div>
		);
	}
}