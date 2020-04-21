import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import GroupForm from '../forms/groupForm';
import MinifiableText from '../minifiableText';
import PaginationControls from '../paginationControls';

const seo = {
  title: `${app.name} | Groups`
};

const unsub = {
  fetch: null,
  fetchCount: null,
  timer: null
};

const orderBy = [ 
  { type: 'created_num', label: 'Data creazione', icon: icon.calendar }, 
  { type: 'followers_num', label: 'Iscritti', icon: icon.formatTitle }, 
  { type: 'title', label: 'Titolo', icon: icon.star }
];

const limit = 5;

const Groups = () => {
  const { isAuth, isEditor } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(null);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState(false);
  const [selectedGid, setSelectedGid] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [desc, setDesc] = useState(true);
  const [orderByIndex, setOrderByIndex] = useState(0);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const is = useRef(true);

  const fetchCount = useCallback(() => {
    countRef('groups').onSnapshot(fullSnap => {
      if (fullSnap.exists) { 
        if (is.current) {
          setCount(fullSnap.data().count);
        }
      } else if (is.current) {
        setCount(0);
      }
    }, err => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }, [openSnackbar]);

  const setEmptyState = useCallback(err => {
    setFirstVisible(null);
    setItems(null); 
    setLastVisible(null);
    setPage(1);
    setLoading(false);
    if (err) openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const fetch = useCallback(e => {
    const direction = e?.currentTarget.dataset.direction;

    unsub.timer = setTimeout(() => { 
      const prev = direction === 'prev';
      const ref = groupsRef.orderBy(orderBy[orderByIndex].type, desc === prev ? 'asc' : 'desc').limit(limit);
      const sRef = searchText ? groupsRef.where('title', '>=', searchText).limit(1) : ref;
      const paginatedRef = sRef.startAfter(prev ? firstVisible : lastVisible);
      const dRef = direction ? paginatedRef : sRef;

      if (is.current) setLoading(true);

      unsub.groupsFetch = dRef.onSnapshot(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          setFirstVisible(snap.docs[prev ? snap.size - 1 : 0]);
          setItems(prev ? items.reverse() : items);
          setLastVisible(snap.docs[prev ? 0 : snap.size - 1]);
          setPage(page => direction ? prev ? page - 1 : ((page * limit) > count) ? page : page + 1 : 1);
          setLoading(false);
        } else {
          setEmptyState();
        }
      }, err => setEmptyState(err));
    }, searchText ? 500 : 0);
  }, [count, desc, firstVisible, lastVisible, orderByIndex, searchText, setEmptyState]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line
  }, [desc, orderByIndex, searchText]);

  useEffect(() => () => {
    is.current = false;
    unsub.timer && clearTimeout(unsub.timer);
  }, []);

  const onCreateGroup = e => {
    const { gid } = e.currentTarget.dataset;
    setIsOpenEditDialog(true);
    if (gid) setSelectedGid(gid);
  };

  const onToggleEditDialog = () => {
    setIsOpenEditDialog(!isOpenEditDialog);
    setSelectedGid(null);
  };

  const onChange = e => {
    e.persist();
    const { value } = e.target;

    clearTimeout(unsub.timer);
    if (is.current) setSearchText(capitalize(value));
  };

  const onChangeOrderBy = useCallback((e, i) => {
    if (is.current) {
      setOrderByIndex(i);
      setOrderMenuAnchorEl(null);
      setPage(1);
    }
  }, []);

  const onToggleDesc = useCallback(() => setDesc(desc => !desc), []);

  const onOpenOrderMenu = useCallback(e => setOrderMenuAnchorEl(e.currentTarget), []);
  
  const onCloseOrderMenu = useCallback(() => setOrderMenuAnchorEl(null), []);

  const orderByOptions = useMemo(() => orderBy.map((option, i) => (
    <MenuItem
      key={option.type}
      disabled={i === -1}
      selected={i === orderByIndex}
      onClick={e => onChangeOrderBy(e, i)}>
      <ListItemIcon>{orderBy[i].icon}</ListItemIcon>
      <Typography variant="inherit">{orderBy[i].label}</Typography>
    </MenuItem>
  )), [onChangeOrderBy, orderByIndex]);

  const onResetSearchText = () => setSearchText('');

  return (
    <div className="container" ref={is}>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className={`info-row row lighter-text ${loading && !items ? 'hidden' : 'show'}`}>
        <div className="col">
          {items?.length || 0} di {count} gruppi
        </div>
        <div className="col text-right">
          <button 
            type="button"
            className="btn sm rounded flat counter" 
            onClick={onOpenOrderMenu} 
            disabled={count < 2}>
            <span className="hide-sm">Ordina per {orderBy[orderByIndex].label}</span>
            <span className="show-sm">{orderBy[orderByIndex].icon}</span>
          </button>
          <Menu 
            className="dropdown-menu"
            anchorEl={orderMenuAnchorEl} 
            open={Boolean(orderMenuAnchorEl)} 
            onClose={onCloseOrderMenu}>
            {orderByOptions}
          </Menu>
          <Tooltip title={desc ? 'Ascendente' : 'Discendente'}>
            <span>
              <button
                type="button"
                className={`btn sm rounded flat counter icon ${desc ? 'desc' : 'asc'}`}
                onClick={onToggleDesc}
                disabled={count < 2}>
                {icon.arrowDown}
              </button>
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="col">
            <ThemeProvider theme={darkTheme}>
              <TextField
                fullWidth
                id="search"
                name="search"
                type="text"
                label="Cerca gruppo"
                placeholder="es: Assistenza Biblo.space"
                value={searchText || ''}
                onChange={onChange}
                variant="outlined"
                size="small"
                InputProps={searchText ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <button type="button" className="btn rounded flat icon counter" onClick={onResetSearchText}>{icon.close}</button>
                    </InputAdornment>
                  ),
                }: null}
              />
            </ThemeProvider>
          </div>
          {isAuth && isEditor && (
            <div className="col-auto">
              <button
                type="button"
                className="btn primary centered counter"
                style={{ '--btnHeight': '40px', }}
                onClick={onCreateGroup}
                disabled={!isEditor}>
                Crea <span className="hide-xs">gruppo</span>
              </button>
            </div>
          )}
        </div>
        
      </div>
      
      <div className="groups-list">
        {loading && !items ? (
          <div aria-hidden="true" className="relative loader"><CircularProgress /></div>
        ) : !items ? (
          <div className="empty pad-v text-center">Nessun gruppo trovato</div>
        ) : items.map(item => (
          <div className="card group box" key={item.gid}>
            {!item.edit && (
              <Tooltip title="Gruppo bloccato">
                <div className="absolute-top-right lighter-text">{icon.lock}</div>
              </Tooltip>
            )}
            <div className="row info-row">
              <div className="col-auto">
                <Avatar className="image avatar">
                  {!item.photoURL ? icon.accountGroup : (
                    <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                      <img alt="avatar" src={item.photoURL} className="avatar thumb" />
                    </Zoom>
                  )}
                </Avatar>
              </div>
              <div className="col">
                <h2><Link to={`/group/${item.gid}`}>{item.title}</Link></h2>
                <div className="info-row owner">
                  <span className="counter">
                    Creato da <Link to={`/dashboard/${item.ownerUid}`}>{item.owner}</Link>&nbsp;
                    <span className="hide-xs" title={new Date(item.created_num).toLocaleString()}>
                      {timeSince(item.created_num)}
                    </span>
                  </span>
                  <span className="counter">
                    <b>{item.followers_num}</b> iscritti
                  </span>
                </div>
                <div className="info-row text">
                  <MinifiableText text={item.description} maxChars={300} forced />
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
          // loading={loading}
          // oneWay
          page={page}
        />
      )}

      {isOpenEditDialog && <GroupForm id={selectedGid} onToggle={onToggleEditDialog} />}

    </div>
  );
};

export default Groups;