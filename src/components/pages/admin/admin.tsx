import { CircularProgress } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import classnames from 'classnames';
import React, { ChangeEvent, CSSProperties, FC, Fragment, ReactNode, useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, RouteComponentProps } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import icon from '../../../config/icons';
import { app, screenSize } from '../../../config/shared';
import UserContext from '../../../context/userContext';
import { ScreenSizeType, UserContextModel, UserModel } from '../../../types';
import AuthorForm from '../../forms/authorForm';
import CollectionForm from '../../forms/collectionForm';
import NoteForm from '../../forms/noteForm';
import QuoteForm from '../../forms/quoteForm';
import UserForm from '../../forms/userForm';
import AuthorsDash from './authorsDash';
import BooksDash from './booksDash';
import CollectionsDash from './collectionsDash';
import NotesDash from './notesDash';
import QuotesDash from './quotesDash';
import UsersDash from './usersDash';

const containerStyle: CSSProperties = { maxWidth: 1280, };
const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);

interface TabModel {
  name: string;
  label: string;
  icon: ReactNode;
}

const tabs: TabModel[] = [
  { name: 'users', label: 'Utenti', icon: icon.account },
  { name: 'books', label: 'Libri', icon: icon.book },
  { name: 'authors', label: 'Autori', icon: icon.accountEdit },
  { name: 'collections', label: 'Collezioni', icon: icon.viewCarousel },
  { name: 'quotes', label: 'Citazioni', icon: icon.quote },
  { name: 'notifications', label: 'Notifiche', icon: icon.bell },
];

interface RouterProps { 
  tab: string;
}

type AdminProps = RouteComponentProps<RouterProps>;

interface StateModel {
  selectedEl: string;
  selectedId: string;
  selectedItem?: UserModel;
  tabSelected: number;
  isOpenUserDialog: boolean;
  isOpenAuthorDialog: boolean;
  isOpenCollectionDialog: boolean;
  isOpenNoteDialog: boolean;
  isOpenQuoteDialog: boolean;
  screenSize: ScreenSizeType;
}

const initialState: StateModel = {
  selectedEl: '',
  selectedId: '',
  selectedItem: undefined,
  tabSelected: 0,
  isOpenUserDialog: false,
  isOpenAuthorDialog: false,
  isOpenCollectionDialog: false,
  isOpenNoteDialog: false,
  isOpenQuoteDialog: false,
  screenSize: screenSize(),
};

const Admin: FC<AdminProps> = ({ history, match }: AdminProps) => {
  const { isAdmin, user } = useContext<UserContextModel>(UserContext);
  const [selectedEl, setSelectedEl] = useState<string>(initialState.selectedEl);
  const [selectedId, setSelectedId] = useState<string>(initialState.selectedId);
  const [selectedItem, setSelectedItem] = useState<UserModel | undefined>(initialState.selectedItem);
  const [tabSelected, setTabSelected] = useState<number>(initialState.tabSelected);
  const [isOpenUserDialog, setIsOpenUserDialog] = useState<boolean>(initialState.isOpenUserDialog);
  const [isOpenAuthorDialog, setIsOpenAuthorDialog] = useState<boolean>(initialState.isOpenAuthorDialog);
  const [isOpenCollectionDialog, setIsOpenCollectionDialog] = useState<boolean>(initialState.isOpenCollectionDialog);
  const [isOpenNoteDialog, setIsOpenNoteDialog] = useState<boolean>(initialState.isOpenNoteDialog);
  const [isOpenQuoteDialog, setIsOpenQuoteDialog] = useState<boolean>(initialState.isOpenQuoteDialog);
  const [_screenSize, setScreenSize] = useState<ScreenSizeType>(initialState.screenSize);

  useEffect(() => {
    if (tabSelected === 0) history.replace(`/admin/${tabs[0].name}`, null);
  }, [history, tabSelected]);

  useEffect(() => {
    const tabSelectedIndex: number = tabs.findIndex((tab: TabModel): boolean => tab.name === match.params.tab);
    setTabSelected(tabSelectedIndex !== -1 ? tabSelectedIndex : 0);
  }, [match.params.tab]);

  useEffect(() => {
    const updateScreenSize = (): void => {
      setScreenSize(screenSize());
    };

    window.addEventListener('resize', updateScreenSize);

    return (): void => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  const historyPushTabIndex = (index: number): void => {
    const newPath = `/admin/${tabs[index].name}`;
    if (String(history) !== newPath) {
      history.push(newPath, null);
    }
  };

  const onTabSelect = (value: number): void => {
    if (value !== -1) {
      setTabSelected(value);
      historyPushTabIndex(value);
    }
  };

  const onTabSelectIndex = (index: number): void => {
    if (index !== -1) {
      setTabSelected(index);
      historyPushTabIndex(index);
    }
  };

  const son = (id?: string): string => id ? typeof id === 'string' ? id : typeof id === 'number' ? String(id) : '' : '';

  const onToggleAuthorDialog = (id?: string): void => {
    setIsOpenAuthorDialog(isOpenAuthorDialog => !isOpenAuthorDialog);
    setSelectedId(son(id));
  };

  const onToggleCollectionDialog = (id?: string): void => {
    setIsOpenCollectionDialog(isOpenCollectionDialog => !isOpenCollectionDialog);
    setSelectedId(son(id));
  };

  const onToggleUserDialog = (item?: UserModel): void => {
    setIsOpenUserDialog(isOpenUserDialog => !isOpenUserDialog);
    setSelectedId(son(item?.uid));
    setSelectedItem(item);
  };

  const onToggleNoteDialog = (id?: string, el?: string): void => {
    setIsOpenNoteDialog(isOpenNoteDialog => !isOpenNoteDialog);
    setSelectedId(son(id));
    setSelectedEl(son(el));
  };

  const onToggleQuoteDialog = (id?: string): void => {
    setIsOpenQuoteDialog(isOpenQuoteDialog => !isOpenQuoteDialog);
    setSelectedId(son(id));
  };

  if (!user) return <div aria-hidden='true' className='loader'><CircularProgress /></div>;

  if (!isAdmin) {
    return (
      <div className='container'>
        <div className='card flat empty text-center'>
          <p>{icon.cancel}</p>
          <p>Area riservata agli amministratori</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container' style={containerStyle}>
      <Helmet>
        <title>{app.name} | Amministrazione</title>
        <meta name='robots' content='noindex, nofollow' />
      </Helmet>
      <div className='actions btns text-center pad-v-sm'>
        <button type='button' title='Crea libro' className='btn rounded primary'>
          <Link to='/new-book'>
            <span className='hide-sm'>{icon.plus} libro</span><span className='show-sm'>{icon.book}</span>
          </Link>
        </button>
        <button type='button' onClick={() => onToggleAuthorDialog()} title='Crea autore' className={classnames('btn', 'rounded', isOpenAuthorDialog ? 'flat' : 'primary')}>
          <span className='hide-sm'>{icon.plus} autore</span><span className='show-sm'>{icon.accountEdit}</span>
        </button>
        <button type='button' onClick={() => onToggleCollectionDialog()} title='Crea collezione' className={classnames('btn', 'rounded', isOpenCollectionDialog ? 'flat' : 'primary')}>
          <span className='hide-sm'>{icon.plus} collezione</span><span className='show-sm'>{icon.viewCarousel}</span>
        </button>
        <button type='button' onClick={() => onToggleQuoteDialog()} title='Crea citazione' className={classnames('btn', 'rounded', isOpenQuoteDialog ? 'flat' : 'primary')}>
          <span className='hide-sm'>{icon.plus} citazione</span><span className='show-sm'>{icon.quote}</span>
        </button>
        {/* <button type='button' onClick={() => onToggleNoteDialog()} title='Crea notifica' className='btn rounded primary'><span className='hide-sm'>{icon.plus} notifica</span><span className='show-sm'>{icon.bell}</span></button> */}
      </div>
      <AppBar position='static' className='appbar flat'>
        <Tabs 
          value={tabSelected}
          onChange={(_: ChangeEvent<{}>, value: number): void => onTabSelect(value)}
          variant={_screenSize === 'sm' ? 'scrollable' : 'fullWidth'}
          indicatorColor='primary'
          // textColor='primary'
          scrollButtons='auto'>
          {tabs.map(tab => (
            <Tab key={tab.name} label={<><span className='show-md'>{tab.icon}</span><span className='hide-md'>{tab.label}</span></>} />
          ))}
        </Tabs>
      </AppBar>
      <BindKeyboardSwipeableViews
        animateHeight
        enableMouseEvents
        resistance
        className='tabs-container'
        axis='x'
        index={tabSelected}
        onChangeIndex={onTabSelectIndex}>
        <div className='card dark'>
          {tabSelected === 0 && <UsersDash onToggleDialog={onToggleUserDialog} onToggleNoteDialog={onToggleNoteDialog} />}
        </div>
        <div className='card dark'>
          {tabSelected === 1 && <BooksDash />}
        </div>
        <div className='card dark'>
          {tabSelected === 2 && <AuthorsDash onToggleDialog={onToggleAuthorDialog} />}
        </div>
        <div className='card dark'>
          {tabSelected === 3 && <CollectionsDash onToggleDialog={onToggleCollectionDialog} />}
        </div>
        <div className='card dark'>
          {tabSelected === 4 && <QuotesDash onToggleDialog={onToggleQuoteDialog} />}
        </div>
        <div className='card dark'>
          {tabSelected === 5 && <NotesDash onToggleDialog={onToggleNoteDialog} />}
        </div>
      </BindKeyboardSwipeableViews>

      {isOpenUserDialog && selectedItem && <UserForm user={selectedItem} onToggle={onToggleUserDialog} />}
    
      <Fragment>
        {isOpenAuthorDialog && <AuthorForm id={selectedId} onToggle={onToggleAuthorDialog} />}
        {isOpenCollectionDialog && <CollectionForm id={selectedId} onToggle={onToggleCollectionDialog} />}
        {isOpenNoteDialog && <NoteForm uid={selectedId} nid={selectedEl} onToggle={onToggleNoteDialog} />}
        {isOpenQuoteDialog && <QuoteForm id={selectedId} onToggle={onToggleQuoteDialog} />}
      </Fragment>
    </div>
  );
};
 
export default Admin;