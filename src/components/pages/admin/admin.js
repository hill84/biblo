import AppBar from '@material-ui/core/AppBar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import { userRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { app, screenSize } from '../../../config/shared';
import { funcType, historyType, userType, matchType } from '../../../config/types';
import AuthorForm from '../../forms/authorForm';
/* import CollectionForm from '../../forms/collectionForm'; */
import NoteForm from '../../forms/noteForm';
import QuoteForm from '../../forms/quoteForm';
import AuthorsDash from './authorsDash';
import BooksDash from './booksDash';
import CollectionsDash from './collectionsDash';
import NotesDash from './notesDash';
import QuotesDash from './quotesDash';
import UsersDash from './usersDash';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
const tabs = ['users', 'books', 'authors', 'collections', 'quotes', 'notifications'];

export default class Admin extends React.Component {
 	state = {
    isAdmin: false,
    aid: this.props.user && this.props.user.uid,
    openSnackbar: this.props.openSnackbar,
    user: null,
    loadingUser: true,
    selectedEl: null,
    selectedId: null,
    tabSelected: this.props.match.params.tab ? tabs.indexOf(this.props.match.params.tab) !== -1 ? tabs.indexOf(this.props.match.params.tab) : 0 : 0,
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
    if (this.state.tabSelected === 0) this.props.history.replace(`/admin/${tabs[0]}`, null);
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
    if (value !== -1) this.props.history.push(`/admin/${tabs[value]}`, null);
    this.setState({ tabSelected: value });
  }

  onTabSelectIndex = index => this.setState({ tabSelected: index });

  son = id => id ? typeof id === 'string' ? id : typeof id === 'number' ? String(id) : null : null;

  onToggleAuthorDialog = id => this.setState(prevState => ({ isOpenAuthorDialog: !prevState.isOpenAuthorDialog, selectedId: this.son(id) }));
  onToggleCollectionDialog = id => this.setState(prevState => ({ isOpenCollectionDialog: !prevState.isOpenCollectionDialog, selectedId: this.son(id) }));
  onToggleNoteDialog = (id, el) => this.setState(prevState => ({ isOpenNoteDialog: !prevState.isOpenNoteDialog, selectedId: this.son(id), selectedEl: this.son(el) }));
  onToggleQuoteDialog = id => this.setState(prevState => ({ isOpenQuoteDialog: !prevState.isOpenQuoteDialog, selectedId: this.son(id) }));

	render() {
		const { isAdmin, isOpenAuthorDialog, /* isOpenCollectionDialog, */ isOpenNoteDialog, isOpenQuoteDialog, loadingUser, openSnackbar, screenSize, selectedEl, selectedId, tabDir, tabSelected, user } = this.state;

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
          <button type="button" title="Crea libro" className="btn rounded primary"><Link to="/new-book">{icon.plus()} <span className="hide-sm">libro</span><span className="show-sm">{icon.book()}</span></Link></button>
          <button type="button" onClick={this.onToggleAuthorDialog} title="Crea autore" className="btn rounded primary">{icon.plus()} <span className="hide-sm">autore</span><span className="show-sm">{icon.accountEdit()}</span></button>
          {/* <button type="button" onClick={this.onToggleCollectionDialog} title="Crea collezione" className="btn rounded primary">{icon.plus()} <span className="hide-sm">collezione</span><span className="show-sm">{icon.viewCarousel()}</span></button> */}
          <button type="button" onClick={this.onToggleQuoteDialog} title="Crea citazione" className="btn rounded primary">{icon.plus()} <span className="hide-sm">citazione</span><span className="show-sm">{icon.quote()}</span></button>
          {/* <button type="button" onClick={this.onToggleNoteDialog} title="Crea notifica" className="btn rounded primary">{icon.plus()} <span className="hide-sm">notifica</span><span className="show-sm">{icon.bell()}</span></button> */}
        </div>
        <AppBar position="static" className="appbar flat">
          <Tabs 
            value={tabSelected}
            onChange={this.onTabSelect}
            variant={screenSize === 'sm' ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto">
            <Tab label={<><span className="show-md">{icon.account()}</span><span className="hide-md">Utenti</span></>} />
            <Tab label={<><span className="show-md">{icon.book()}</span><span className="hide-md">Libri</span></>} />
            <Tab label={<><span className="show-md">{icon.accountEdit()}</span><span className="hide-md">Autori</span></>} />
            <Tab label={<><span className="show-md">{icon.viewCarousel()}</span><span className="hide-md">Collezioni</span></>} />
            <Tab label={<><span className="show-md">{icon.quote()}</span><span className="hide-md">Citazioni</span></>} />
            <Tab label={<><span className="show-md">{icon.bell()}</span><span className="hide-md">Notifiche</span></>} />
          </Tabs>
        </AppBar>
        <BindKeyboardSwipeableViews
          enableMouseEvents
          resistance
          className="tabs-container"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.onTabSelectIndex}>
          <>
            {tabSelected === 0 && 
              <div className="tab" dir={tabDir}>
                <UsersDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleNoteDialog} />
              </div>
            }
          </>
          <>
            {tabSelected === 1 && 
              <div className="tab" dir={tabDir}>
                <BooksDash user={user} openSnackbar={openSnackbar} />
              </div>
            }
          </>
          <>
            {tabSelected === 2 && 
              <div className="tab" dir={tabDir}>
                <AuthorsDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleAuthorDialog} />
              </div>
            }
          </>
          <>
            {tabSelected === 3 && 
              <div className="tab" dir={tabDir}>
                <CollectionsDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleCollectionDialog} />
              </div>
            }
          </>
          <>
            {tabSelected === 4 && 
              <div className="tab" dir={tabDir}>
                <QuotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleQuoteDialog} />
              </div>
            }
          </>
          <>
            {tabSelected === 5 && 
              <div className="tab" dir={tabDir}>
                <NotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={this.onToggleNoteDialog} />
              </div>
            }
          </>
        </BindKeyboardSwipeableViews>

        {isOpenAuthorDialog && <AuthorForm id={selectedId} onToggle={this.onToggleAuthorDialog} user={user} openSnackbar={openSnackbar} />}
        {/* isOpenCollectionDialog && <CollectionForm id={selectedId} onToggle={this.onToggleCollectionDialog} user={user} openSnackbar={openSnackbar} /> */}
        {isOpenNoteDialog && <NoteForm uid={selectedId} nid={selectedEl} onToggle={this.onToggleNoteDialog} user={user} openSnackbar={openSnackbar} />}
        {isOpenQuoteDialog && <QuoteForm id={selectedId} onToggle={this.onToggleQuoteDialog} user={user} openSnackbar={openSnackbar} />}
			</div>
		);
	}
}