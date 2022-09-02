import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import { TextField } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';
import classnames from 'classnames';
import React, { ChangeEvent, CSSProperties, FC, MouseEvent, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { Link } from 'react-router-dom';
import { countRef, groupsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, capitalize, handleFirestoreError, timeSince } from '../../config/shared';
import { darkTheme } from '../../config/themes';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/groups.css';
import { CurrentTarget, GroupModel, IsCurrent, OrderByModel } from '../../types';
import GroupForm from '../forms/groupForm';
import MinifiableText from '../minifiableText';
import PaginationControls from '../paginationControls';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';

const limit = 3;
const searchLimit = 2;

export const mark = (text: string, searchText?: string, searchLimit?: number): ReactNode => {
  const sanitizedText: string = DOMPurify.sanitize(text);
  if (!sanitizedText || !searchText) return text;
  const sanitizedSearchText: string = DOMPurify.sanitize(searchText);
  if (sanitizedSearchText && (searchLimit ? searchText.length > searchLimit : true) && text.toLowerCase().includes(searchText.toLowerCase())) {
    const dirtyHtml: string = sanitizedText.replace(new RegExp(sanitizedSearchText, 'gi'), (sanitizedSearchText: string): string => `<mark>${sanitizedSearchText}</mark>`);
    const sanitizedHtml: string = DOMPurify.sanitize(dirtyHtml);
    return (
      <data value={sanitizedText} dangerouslySetInnerHTML={{
        __html: sanitizedHtml
      }} />
    );
  }
  return text;
};

let fetchItemsCanceler: null | (() => void) = null;
let timeout: null | number = null;

interface StateModel {
  count: number;
  desc: boolean;
  firstVisible: DocumentData | null;
  isOpenEditDialog: boolean;
  items: GroupModel[];
  lastVisible: DocumentData | null;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl?: Element;
  page: number;
  searchText: string;
  selectedGid: string;
}

const initialState: StateModel = {
  count: 0,
  desc: false,
  firstVisible: null,
  isOpenEditDialog: false,
  items: [],
  lastVisible: null,
  loading: true,
  orderByIndex: 0,
  orderMenuAnchorEl: undefined,
  page: 1,
  searchText: '',
  selectedGid: '',
};

const Groups: FC = () => {
  const { isAdmin, isAuth, isEditor } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading); // false
  const [items, setItems] = useState<StateModel['items']>(initialState.items);
  const [count, setCount] = useState<StateModel['count']>(initialState.count);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState<StateModel['isOpenEditDialog']>(initialState.isOpenEditDialog);
  const [selectedGid, setSelectedGid] = useState<StateModel['selectedGid']>(initialState.selectedGid);
  const [searchText, setSearchText] = useState<StateModel['searchText']>(initialState.searchText);
  const [desc, setDesc] = useState<StateModel['desc']>(initialState.desc);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [firstVisible, setFirstVisible] = useState<StateModel['firstVisible']>(initialState.firstVisible);
  const [lastVisible, setLastVisible] = useState<StateModel['lastVisible']>(initialState.lastVisible);

  const { t } = useTranslation(['common', 'form']);

  const is = useRef<IsCurrent>(true);

  const seo = {
    title: `${app.name} | ${t('PAGE_GROUPS')}`
  };

  const orderBy = useMemo((): OrderByModel[] => [ 
    { type: 'created_num', label: t('CREATED_DATE'), icon: icon.calendar }, 
    { type: 'followers_num', label: t('SUBSCRIBERS'), icon: icon.formatTitle }, 
    { type: 'title', label: t('TITLE'), icon: icon.star },
  ], [t]);

  const order: OrderByModel = orderBy[orderByIndex];
  const searching = useMemo((): boolean => searchText.length > searchLimit, [searchText.length]);

  const fetcher = useCallback(() => {
    // console.log('fetcher');
    const ref: Query<DocumentData> = groupsRef.orderBy(order.type, desc ? 'desc' : 'asc').limit(limit);
    
    setLoading(true);
    fetchItemsCanceler = ref.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: GroupModel[] = [];
        snap.forEach((item: DocumentData): number => items.push(item.data()));
        setFirstVisible(snap.docs[0]);
        setItems(items);
        setLastVisible(snap.docs[snap.size - 1]);
      } else {
        setFirstVisible(initialState.firstVisible);
        setItems(initialState.items);
        setLastVisible(initialState.lastVisible);
      }
      setLoading(false);
      setPage(initialState.page);
    }, (err: Error): void => console.warn(err));
  }, [desc, order.type]);

  const search = useCallback((): void => {
    if (!searching) return;
    timeout = window.setTimeout((): void => {
      // console.log('search');
      const searchBy = 'title';
      const ref: Query<DocumentData> = groupsRef.where(searchBy, '>=', searchText).limit(limit).orderBy(searchBy, 'asc');
      fetchItemsCanceler = ref.onSnapshot((snap: DocumentData): void => {
        if (!snap.empty) {
          const items: GroupModel[] = [];
          snap.forEach((item: DocumentData): number => items.push(item.data()));
          setItems(items);
        } else {
          setItems(initialState.items);
        }
        setFirstVisible(initialState.firstVisible);
        setLastVisible(initialState.lastVisible);
        setPage(initialState.page);
        setLoading(false);
      }, (err: Error): void => console.warn(err));
    }, 1000);
  }, [searchText, searching]);

  const fetch = (e: MouseEvent): void => {
    const direction: string = (e.currentTarget as CurrentTarget).dataset?.direction || '';
    const prev: boolean = direction === 'prev';
    const ref: Query<DocumentData> = groupsRef.orderBy(order.type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef: Query<DocumentData> = ref.startAfter(prev ? firstVisible : lastVisible);
    fetchItemsCanceler = paginatedRef.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: GroupModel[] = [];
        snap.forEach((item: DocumentData): number => items.push(item.data()));
        setFirstVisible(snap.docs[prev ? snap.size - 1 : 0]);
        setItems(prev ? items.reverse() : items);
        setLastVisible(snap.docs[prev ? 0 : snap.size - 1]);
        setPage(page => prev ? page - 1 : ((page * limit) > count) ? page : page + 1);
      } else {
        setFirstVisible(initialState.firstVisible);
        setItems(initialState.items);
        setPage(initialState.page);
        setLastVisible(initialState.lastVisible);
      }
      setLoading(false);
    }, (err: Error): void => console.warn(err));
  };

  const fetchCount = useCallback((): void => {
    // console.log('fetchCount');
    countRef('groups').get().then((fullSnap: DocumentData): void => {
      if (fullSnap.exists) {
        setCount(fullSnap.data()?.count);
        fetcher();
      } else {
        setCount(initialState.count);
      }
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }, [fetcher, openSnackbar]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    search();
  }, [search]);

  useEffect(() => () => {
    is.current = false;
    timeout && clearTimeout(timeout);
    fetchItemsCanceler?.();
  }, []);

  const onCreateGroup = (e: MouseEvent<HTMLButtonElement>): void => {
    const { gid } = e.currentTarget.dataset;
    setIsOpenEditDialog(true);
    if (gid) setSelectedGid(gid);
  };

  const onToggleEditDialog = (): void => {
    setIsOpenEditDialog(!isOpenEditDialog);
    setSelectedGid(initialState.selectedGid);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    // e.persist();
    if (is.current) {
      setSearchText(capitalize(e.target.value));
    }
  };

  const onChangeOrderBy = useCallback((i: number): void => {
    if (is.current) {
      setOrderByIndex(i);
      setOrderMenuAnchorEl(initialState.orderMenuAnchorEl);
      setPage(initialState.page);
    }
  }, []);

  const onToggleDesc = (): void => setDesc(desc => !desc);

  const onOpenOrderMenu = (e: MouseEvent<HTMLButtonElement>): void => setOrderMenuAnchorEl(e.currentTarget);
  
  const onCloseOrderMenu = (): void => setOrderMenuAnchorEl(initialState.orderMenuAnchorEl);

  const onGroupCreated = (): void => setCount(prev => prev + 1);

  // const onGroupDeleted = (): void => setCount(prev => prev - 1);

  const orderByOptions = useMemo(() => orderBy.map((option, i: number) => (
    <MenuItem
      key={option.type}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={() => onChangeOrderBy(i)}>
      <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
      <Typography variant='inherit'>{orderBy[i].label}</Typography>
    </MenuItem>
  )), [onChangeOrderBy, orderBy, orderByIndex]);

  const onResetSearchText = (): void => {
    setSearchText(initialState.searchText);
    fetcher();
  };

  return (
    <div className='container' ref={is}>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className={classnames('info-row', 'row', 'lighter-text', loading && !items.length ? 'hidden' : 'show')}>
        <div className='col'>
          {items.length} {t('OF')} {count} {t('GROUPS').toLowerCase()}
        </div>
        <div className='col text-right'>
          <button 
            type='button'
            className='btn sm rounded flat counter' 
            onClick={onOpenOrderMenu} 
            disabled={searching || count < 2}>
            <span className='hide-sm'>{t('SORT_BY')} {orderBy[orderByIndex].label}</span>
            <span className='show-sm'>{orderBy[orderByIndex].icon}</span>
          </button>
          <Menu 
            className='dropdown-menu'
            anchorEl={orderMenuAnchorEl} 
            open={Boolean(orderMenuAnchorEl)} 
            onClose={onCloseOrderMenu}>
            {orderByOptions}
          </Menu>
          <Tooltip title={t(desc ? 'ASCENDING' : 'DESCENDING')}>
            <span>
              <button
                type='button'
                className={classnames('btn', 'sm', 'rounded', 'flat', 'counter', 'icon', desc ? 'desc' : 'asc')}
                onClick={onToggleDesc}
                disabled={searching || count < 2}>
                {icon.arrowDown}
              </button>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className='card'>
        <div className='row'>
          <div className='col'>
            <ThemeProvider theme={darkTheme}>
              <TextField  
                className='input-field' 
                fullWidth
                id='search'
                label={t('ACTION_SEARCH_GROUP')}
                margin='dense'
                name='search'
                onChange={onChange}
                placeholder={t('form:AT_LEAST_COUNT_CHARACTERS', { count: searchLimit + 1 })}
                style={{ margin: 0 }}
                type='text'
                value={searchText || ''}
                variant='outlined'
                InputProps={{
                  endAdornment: searchText ? (
                    <button type='button' className='btn rounded flat icon counter' onClick={onResetSearchText}>{icon.close}</button>
                  ) : null
                }}
              />
            </ThemeProvider>
          </div>
          {isAuth && isEditor && (
            <div className='col-auto'>
              <button
                type='button'
                className='btn primary centered counter'
                style={{ '--btnHeight': '40px', } as CSSProperties}
                onClick={onCreateGroup}
                disabled={!isEditor}>
                {t('ACTION_CREATE_GROUP')}
              </button>
            </div>
          )}
        </div>
        
      </div>
      
      <div className='groups-list'>
        {loading && !items.length ? (
          <div aria-hidden='true' className='relative loader'><CircularProgress /></div>
        ) : !items.length ? (
          <div className='empty pad-v text-center'>{t('NO_GROUP_FOUND')}</div>
        ) : items.map(({ created_num, description, edit, followers_num, gid, owner, ownerUid, photoURL, title }: GroupModel) => (
          <div key={gid} className={classnames('card', 'group', 'box', { 'primary': searching && title === searchText })} style={{ opacity: searching && !title.toLowerCase().includes(searchText.toLowerCase()) ? 0.3 : undefined }}>
            {!edit && (
              <Tooltip title={t('LOCKED_GROUP')}>
                <div className='absolute-top-right lighter-text'>{icon.lock}</div>
              </Tooltip>
            )}
            <div className='row info-row'>
              <div className='col-auto'>
                <Avatar className='image avatar'>
                  {!photoURL ? icon.accountGroup : (
                    <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
                      <img alt='avatar' src={photoURL} className='avatar thumb' />
                    </Zoom>
                  )}
                </Avatar>
              </div>
              <div className='col'>
                <h2><Link to={`/group/${gid}`}>{mark(title, searchText, searchLimit)}</Link></h2>
                <div className='info-row owner'>
                  <span className='counter'>
                    {t('CREATED_BY')} <Link to={`/dashboard/${ownerUid}`}>{owner}</Link>&nbsp;
                    {isAdmin && (
                      <span className='hide-xs' title={new Date(created_num).toLocaleString()}>
                        {timeSince(created_num)}
                      </span>
                    )}
                  </span>
                  <span className='counter'>
                    <b>{followers_num}</b> {t('SUBSCRIBERS').toLowerCase()}
                  </span>
                </div>
                <div className='info-row text'>
                  <MinifiableText text={description} maxChars={300} forced />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 0 && items?.length < count && !searchText && (
        <PaginationControls 
          count={count} 
          fetch={fetch} 
          limit={limit}
          loading={loading}
          // oneWay
          page={page}
        />
      )}

      {isOpenEditDialog && (
        <GroupForm
          id={selectedGid}
          onToggle={onToggleEditDialog}
          title={searchText}
          onCreated={onGroupCreated}
        />
      )}
    </div>
  );
};

export default Groups;