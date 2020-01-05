import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import icon from '../../../config/icons';
import { app, screenSize } from '../../../config/shared';
import { funcType, historyType, matchType } from '../../../config/types';
import UserContext from '../../../context/userContext';
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

const containerStyle = { maxWidth: 1280, };
const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
const tabs = [
  { name: 'users', label: 'Utenti', icon: icon.account() },
  { name: 'books', label: 'Libri', icon: icon.book() },
  { name: 'authors', label: 'Autori', icon: icon.accountEdit() },
  { name: 'collections', label: 'Collezioni', icon: icon.viewCarousel() },
  { name: 'quotes', label: 'Citazioni', icon: icon.quote() },
  { name: 'notifications', label: 'Notifiche', icon: icon.bell() },
];

const Admin = props => {
  const { user } = useContext(UserContext);
  const { history, match, openSnackbar } = props;
  const [selectedEl, setSelectedEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [tabSelected, setTabSelected] = useState(0);
  const [isOpenAuthorDialog, setIsOpenAuthorDialog] = useState(false);
  const [isOpenCollectionDialog, setIsOpenCollectionDialog] = useState(false);
  const [isOpenNoteDialog, setIsOpenNoteDialog] = useState(false);
  const [isOpenQuoteDialog, setIsOpenQuoteDialog] = useState(false);
  const [_screenSize, setScreenSize] = useState(screenSize());
  const is = useRef(true);

  useEffect(() => {
    if (tabSelected === 0) history.replace(`/admin/${tabs[0].name}`, null);
  }, [history, tabSelected]);

  useEffect(() => {
    const tabSelectedIndex = tabs.findIndex(tab => tab.name === match.params.tab);
    setTabSelected(tabSelectedIndex !== -1 ? tabSelectedIndex : 0);
  }, [match.params.tab]);

  useEffect(() => {
    const updateScreenSize = () => {
      if (is.current) setScreenSize(screenSize());
    };

    window.addEventListener('resize', updateScreenSize);

    return () => {
      is.current = false;
      window.removeEventListener('resize', updateScreenSize);
    }
  }, []);

  const historyPushTabIndex = index => {
    const newPath = `/admin/${tabs[index].name}`;
    if (history !== newPath) {
      history.push(newPath, null);
    }
  };

  const onTabSelect = (e, value) => {
    if (value !== -1) {
      if (is.current) {
        setTabSelected(value);
        historyPushTabIndex(value);
      }
    }
  };

  const onTabSelectIndex = index => {
    if (index !== -1) {
      if (is.current) {
        setTabSelected(index);
        historyPushTabIndex(index);
      }
    }
  };

  const son = id => id ? typeof id === 'string' ? id : typeof id === 'number' ? String(id) : null : null;

  const onToggleAuthorDialog = id => {
    setIsOpenAuthorDialog(!isOpenAuthorDialog);
    setSelectedId(son(id));
  };

  const onToggleCollectionDialog = id => {
    setIsOpenCollectionDialog(!isOpenCollectionDialog);
    setSelectedId(son(id));
  };

  const onToggleNoteDialog = (id, el) => {
    setIsOpenNoteDialog(!isOpenNoteDialog)
    setSelectedId(son(id));
    setSelectedEl(son(el));
  };

  const onToggleQuoteDialog = id => {
    setIsOpenQuoteDialog(!isOpenQuoteDialog);
    setSelectedId(son(id));
  };

  const isAdmin = useMemo(() => user && user.roles && user.roles.admin, [user]);

  if (!isAdmin) {
    return (
      <div className="container empty">
        <div className="card dark empty text-center">
          <p>{icon.cancel()}</p>
          <p>Area riservata agli amministratori</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={containerStyle}>
      <Helmet>
        <title>{app.name} | Amministrazione</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="actions btns text-center pad-v-sm" ref={is}>
        <button type="button" title="Crea libro" className="btn rounded primary">
          <Link to="/new-book"><span className="hide-sm">{icon.plus()} libro</span><span className="show-sm">{icon.book()}</span></Link>
        </button>
        <button type="button" onClick={onToggleAuthorDialog} title="Crea autore" className={`btn rounded ${isOpenAuthorDialog ? 'secondary' : 'primary'}`}>
          <span className="hide-sm">{icon.plus()} autore</span><span className="show-sm">{icon.accountEdit()}</span>
        </button>
        <button type="button" onClick={onToggleCollectionDialog} title="Crea collezione" className={`btn rounded ${isOpenCollectionDialog ? 'secondary' : 'primary'}`}>
          <span className="hide-sm">{icon.plus()} collezione</span><span className="show-sm">{icon.viewCarousel()}</span>
        </button>
        <button type="button" onClick={onToggleQuoteDialog} title="Crea citazione" className={`btn rounded ${isOpenQuoteDialog ? 'secondary' : 'primary'}`}>
          <span className="hide-sm">{icon.plus()} citazione</span><span className="show-sm">{icon.quote()}</span>
        </button>
        {
          // <button type="button" onClick={onToggleNoteDialog} title="Crea notifica" className="btn rounded primary"><span className="hide-sm">{icon.plus()} notifica</span><span className="show-sm">{icon.bell()}</span></button>
        }
      </div>
      <AppBar position="static" className="appbar flat">
        <Tabs 
          value={tabSelected}
          onChange={onTabSelect}
          variant={_screenSize === 'sm' ? 'scrollable' : 'fullWidth'}
          indicatorColor="primary"
          // textColor="primary"
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
        onChangeIndex={onTabSelectIndex}>
        <div className="card dark">
          <UsersDash openSnackbar={openSnackbar} onToggleDialog={onToggleNoteDialog} inView={tabSelected === 0} />
        </div>
        <div className="card dark">
          <BooksDash user={user} openSnackbar={openSnackbar} inView={tabSelected === 1} />
        </div>
        <div className="card dark">
          <AuthorsDash user={user} openSnackbar={openSnackbar} onToggleDialog={onToggleAuthorDialog} inView={tabSelected === 2} />
        </div>
        <div className="card dark">
          <CollectionsDash user={user} openSnackbar={openSnackbar} onToggleDialog={onToggleCollectionDialog} inView={tabSelected === 3} />
        </div>
        <div className="card dark">
          <QuotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={onToggleQuoteDialog} inView={tabSelected === 4} />
        </div>
        <div className="card dark">
          <NotesDash user={user} openSnackbar={openSnackbar} onToggleDialog={onToggleNoteDialog} inView={tabSelected === 5} />
        </div>
      </BindKeyboardSwipeableViews>

      {isOpenAuthorDialog && <AuthorForm id={selectedId} onToggle={onToggleAuthorDialog} openSnackbar={openSnackbar} />}
      {isOpenCollectionDialog && <CollectionForm id={selectedId} onToggle={onToggleCollectionDialog} openSnackbar={openSnackbar} />}
      {isOpenNoteDialog && <NoteForm uid={selectedId} nid={selectedEl} onToggle={onToggleNoteDialog} openSnackbar={openSnackbar} />}
      {isOpenQuoteDialog && <QuoteForm id={selectedId} onToggle={onToggleQuoteDialog} openSnackbar={openSnackbar} />}
    </div>
  );
};

Admin.propTypes = {
  history: historyType,
  match: matchType,
  openSnackbar: funcType.isRequired
}

Admin.defaultProps = {
  history: null,
  match: null
}
 
export default Admin;