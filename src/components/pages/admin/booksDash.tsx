import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { Data } from 'react-csv/components/CommonPropTypes';
import Zoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { bookRef, booksRef, countRef /* , reviewRef */ } from '../../../config/firebase';
import icon from '../../../config/icons';
import { app, handleFirestoreError, isToday, normURL, timeSince } from '../../../config/shared';
import SnackbarContext from '../../../context/snackbarContext';
import useToggle from '../../../hooks/useToggle';
import { BookModel, CurrentTarget, OrderByModel } from '../../../types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

const limitBy: number[] = [15, 25, 50, 100, 250, 500];

const orderBy: OrderByModel[] = [ 
  { type: 'EDIT.lastEdit_num', label: 'Data ultima modifica'}, 
  { type: 'EDIT.lastEditByUid', label: 'Modificato da'},
  { type: 'EDIT.created_num', label: 'Data creazione'}, 
  { type: 'EDIT.createdByUid', label: 'Creato da'},  
  { type: 'title', label: 'Titolo'},
  { type: 'rating_num', label: 'Voto'},
  { type: 'ratings_num', label: 'Voti'},
  { type: 'readers_num', label: 'Lettori'},
  { type: 'reviews_num', label: 'Recensioni'}
];

let itemsFetch: (() => void) | undefined;

interface StateModel {
  count: number;
  desc: boolean;
  firstVisible: DocumentData | null;
  isOpenDeleteDialog: boolean;
  items: BookModel[];
  lastVisible: DocumentData | null;
  limitByIndex: number;
  limitMenuAnchorEl?: Element;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl?: Element;
  page: number;
  redirectTo: string;
  selectedId: string;
}

const initialState: StateModel = {
  count: 0,
  desc: true,
  firstVisible: null,
  isOpenDeleteDialog: false,
  items: [],
  lastVisible: null,
  limitByIndex: 0,
  limitMenuAnchorEl: undefined,
  loading: true,
  orderByIndex: 0,
  orderMenuAnchorEl: undefined,
  page: 1,
  redirectTo: '',
  selectedId: '',
};

const BooksDash: FC = () => {
  const [count, setCount] = useState<StateModel['count']>(initialState.count);
  const [desc, onToggleDesc] = useToggle(initialState.desc);
  const [firstVisible, setFirstVisible] = useState<StateModel['firstVisible']>(initialState.firstVisible);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<StateModel['isOpenDeleteDialog']>(initialState.isOpenDeleteDialog);
  const [items, setItems] = useState<StateModel['items']>(initialState.items);
  const [lastVisible, setLastVisible] = useState<StateModel['lastVisible']>(initialState.lastVisible);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState<StateModel['limitMenuAnchorEl']>(initialState.limitMenuAnchorEl);
  const [limitByIndex, setLimitByIndex] = useState<StateModel['limitByIndex']>(initialState.limitByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);
  const [redirectTo, setRedirectTo] = useState<StateModel['redirectTo']>(initialState.redirectTo);
  const [selectedId, setSelectedId] = useState<StateModel['selectedId']>(initialState.selectedId);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading);

  const { openSnackbar } = useContext(SnackbarContext);

  const limit: number = limitBy[limitByIndex];
  const order: OrderByModel = orderBy[orderByIndex];

  const fetcher = useCallback(() => {
    const ref: Query<DocumentData> = booksRef.orderBy(order.type, desc ? 'desc' : 'asc').limit(limit);

    setLoading(true);
    itemsFetch = ref.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: BookModel[] = [];
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
    }, (err: Error): void => {
      console.warn(err);
    });
  }, [desc, limit, order.type]);

  const fetch = (e: MouseEvent): void => {
    const prev: boolean = (e.currentTarget as CurrentTarget).dataset?.direction === 'prev';
    const ref: Query<DocumentData> = booksRef.orderBy(order.type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef: Query<DocumentData> = ref.startAfter(prev ? firstVisible : lastVisible);

    itemsFetch = paginatedRef.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: BookModel[] = [];
        snap.forEach((item: DocumentData): number => items.push(item.data()));
        setFirstVisible(snap.docs[prev ? snap.size - 1 : 0]);
        setItems(prev ? items.reverse() : items);
        setLastVisible(snap.docs[prev ? 0 : snap.size - 1]);
        setPage(prev ? page - 1 : ((page * limit) > count) ? page : page + 1);
      } else {
        setFirstVisible(initialState.firstVisible);
        setItems(initialState.items);
        setPage(initialState.page);
        setLastVisible(initialState.lastVisible);
      }
      setLoading(false);
    }, (err: Error): void => {
      console.warn(err);
    });
  };

  useEffect(() => {
    countRef('books').get().then((fullSnap: DocumentData): void => {
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

  useEffect(() => () => {
    itemsFetch?.();
  }, []);

  // const onToggleDesc = (): void => setDesc(desc => !desc);
  
  const onOpenOrderMenu = (e: MouseEvent): void => setOrderMenuAnchorEl(e.currentTarget);
  const onChangeOrderBy = (i: number): void => {
    setOrderByIndex(i);
    setOrderMenuAnchorEl(undefined);
    setPage(initialState.page);
  };
  const onCloseOrderMenu = (): void => setOrderMenuAnchorEl(undefined);

  const onOpenLimitMenu = (e: MouseEvent): void => setLimitMenuAnchorEl(e.currentTarget);
  const onChangeLimitBy = (i: number): void => {
    setLimitByIndex(i);
    setLimitMenuAnchorEl(undefined);
    setPage(initialState.page);
  };
  const onCloseLimitMenu = (): void => setLimitMenuAnchorEl(undefined);

  const onView = ({ bid, title }: { bid: string; title: string }): void => {
    setRedirectTo(title ? `${bid}/${title}` : bid);
  };
  
  const onEdit = ({ bid, title }: { bid: string; title: string }): void => {
    setRedirectTo(title ? `${bid}/${title}` : bid); // TODO
  };

  const onLock = ({ bid, state }: { bid: string; state: boolean }): void => {
    if (state) {
      // console.log(`Locking ${bid}`);
      bookRef(bid).update({ 'EDIT.edit': false }).then((): void => {
        openSnackbar('Elemento bloccato', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      // console.log(`Unlocking ${bid}`);
      bookRef(bid).update({ 'EDIT.edit': true }).then((): void => {
        openSnackbar('Elemento sbloccato', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const onDeleteRequest = ({ bid }: { bid: string }): void => {
    setIsOpenDeleteDialog(true);
    setSelectedId(bid);
  };
  const onCloseDeleteDialog = (): void => {
    setIsOpenDeleteDialog(false);
    setSelectedId('');
  };
  const onDelete = (): void => {
    setIsOpenDeleteDialog(false);
    bookRef(selectedId).delete().then((): void => {
      /* reviewRef(selectedId).delete().then((): void => {
        console.log(`✔ Reviews deleted`);
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error')); */
      openSnackbar('Elemento cancellato', 'success');
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  };
  
  if (redirectTo) return (
    <Redirect to={`/book/${redirectTo}`} />
  );

  const orderByOptions = orderBy.map((option: OrderByModel, index: number) => (
    <MenuItem
      key={option.type}
      disabled={index === -1}
      selected={index === orderByIndex}
      onClick={() => onChangeOrderBy(index)}>
      {option.label}
    </MenuItem>
  ));

  const limitByOptions = limitBy.map((option: number, index: number) => (
    <MenuItem
      key={option}
      disabled={index === -1}
      selected={index === limitByIndex}
      onClick={() => onChangeLimitBy(index)}>
      {option}
    </MenuItem>
  ));

  const skeletons = [...Array(limit)].map((_, i: number) => <li key={i} className='avatar-row skltn dash' />);

  const itemsList = loading ? skeletons : !items ? (
    <li className='empty text-center'>Nessun elemento</li>
  ) : (
    items.map(({ authors, bid, covers, EDIT, /* ISBN_10, */ ISBN_13, rating_num, ratings_num, readers_num, reviews_num, title }: BookModel) => (
      <li key={bid} className={classnames('avatar-row', { locked: !EDIT.edit })}>
        <div className='row'>
          <div className='col-auto'>
            <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
              <img alt='cover' src={covers[0]} className='mock-cover xs' />
            </Zoom>
          </div>
          <Link to={`/book/${bid}/${normURL(title)}`} className='col'>
            {title}
          </Link>
          <Link to={`/author/${normURL(Object.keys(authors)[0])}`} className="col">
            {Object.keys(authors)[0]}
          </Link>
          <div className='col-lg col-md-2 hide-md'>
            <div className='row text-center monotype'>
              <div className={classnames('col', { 'lightest-text': !rating_num })}>
                {Math.round(rating_num / ratings_num * 10) / 10 || 0}
              </div>
              <div className={classnames('col', { 'lightest-text': !ratings_num })}>{ratings_num}</div>
              <div className={classnames('col', { 'lightest-text': !readers_num })}>{readers_num}</div>
              <div className={classnames('col', { 'lightest-text': !reviews_num })}>{reviews_num}</div>
            </div>
          </div>
          <div className='col hide-md monotype' title={bid}>
            <CopyToClipboard text={bid}/>
          </div>
          <div className='col hide-md monotype' title={String(ISBN_13)}>
            <CopyToClipboard text={String(ISBN_13)}/>
          </div>
          {/* <div className='col-1 hide-md monotype' title={ISBN_10}>
            <CopyToClipboard text={ISBN_10} />
          </div> */}
          <Link to={`/dashboard/${EDIT.createdByUid}`} title={EDIT.createdByUid} className='col hide-sm col-lg-1'>
            {EDIT.createdBy}
          </Link>
          <div className='col col-lg-1 hide-sm'>
            <div className='timestamp' title={new Date(EDIT.created_num).toLocaleString()}>
              {isToday(EDIT.created_num) ? new Date(EDIT.created_num).toLocaleTimeString() : new Date(EDIT.created_num).toLocaleDateString()}
            </div>
          </div>
          <Link to={`/dashboard/${EDIT.lastEditByUid}`} title={EDIT.lastEditByUid} className='col col-lg-1'>
            {EDIT.lastEditBy}
          </Link>
          <div className='col col-lg-1 text-right'>
            <div className='timestamp'>
              {isToday(EDIT.lastEdit_num) ? new Date(EDIT.lastEdit_num).toLocaleTimeString() : timeSince(EDIT.lastEdit_num)}
            </div>
          </div>
          <div className='absolute-row right btns xs'>
            <button
              type='button'
              className='btn icon green'
              onClick={() => onView({ bid, title })}
              title='Anteprima'>
              {icon.eye}
            </button>
            <button
              type='button'
              className='btn icon primary'
              onClick={() => onEdit({ bid, title })}
              title='Modifica'>
              {icon.pencil}
            </button>
            <button
              type='button'
              className={classnames('btn', 'icon', EDIT.edit ? 'secondary' : 'flat')}
              onClick={() => onLock({ bid, state: EDIT.edit })}
              title={EDIT.edit ? 'Blocca' : 'Sblocca'}>
              {icon.lock}
            </button>
            <button
              type='button'
              className='btn icon red'
              onClick={() => onDeleteRequest({ bid })}>
              {icon.close}
            </button>
          </div>
        </div>
      </li>
    ))
  );

  const sitemapData: Data | undefined = items.map(item => ([
    `<url> <loc>${app.url}/book/${item.bid}/${normURL(item.title)}</loc> </url>`
  ]));

  return (
    <Fragment>
      <div className='head nav'>
        <div className='row'>
          <div className='col'>
            <span className='counter hide-md'>{`${items.length || 0} di ${count || 0}`}</span>
            <button
              type='button'
              className='btn sm flat counter last'
              disabled={!items.length}
              onClick={onOpenLimitMenu}
            >
              {limit} <span className='hide-xs'>per pagina</span>
            </button>
            <Menu 
              anchorEl={limitMenuAnchorEl}
              className='dropdown-menu'
              open={Boolean(limitMenuAnchorEl)}
              onClose={onCloseLimitMenu}
            >
              {limitByOptions}
            </Menu>
          </div>
          
          {Boolean(items.length) && (
            <div className='col-auto'>
              {sitemapData && (
                <CSVLink
                  data={sitemapData}
                  className='counter'
                  filename='sitemap_books.csv'>
                  Sitemap
                </CSVLink>
              )}
              <button type='button' className='btn sm flat counter' onClick={onOpenOrderMenu}>
                <span className='hide-xs'>Ordina per</span> {orderBy[orderByIndex].label}
              </button>
              <Menu 
                className='dropdown-menu'
                anchorEl={orderMenuAnchorEl} 
                open={Boolean(orderMenuAnchorEl)} 
                onClose={onCloseOrderMenu}>
                {orderByOptions}
              </Menu>
              <button
                type='button'
                className={classnames('btn', 'sm', 'flat', 'counter', 'icon', 'rounded', desc ? 'desc' : 'asc')}
                title={desc ? 'Ascendente' : 'Discendente'}
                onClick={onToggleDesc}>
                {icon.arrowDown}
              </button>
            </div>
          )}
        </div>
      </div>

      <ul className='table dense nolist font-sm'>
        <li className='labels'>
          <div className='row'>
            <div className='col-auto'><div className='mock-cover xs hidden' /></div>
            <div className='col'>Titolo</div>
            <div className='col'>Autore</div>
            <div className='col-lg col-md-2 hide-md'>
              <div className='row text-center'>
                <div className='col' title='Voto'>{icon.star}</div>
                <div className='col' title='Voti'>{icon.starOutline}</div>
                <div className='col' title='Lettori'>{icon.reader}</div>
                <div className='col' title='Recensioni'>{icon.review}</div>
              </div>
            </div>
            <div className='col hide-md'>Bid</div>
            <div className='col hide-md'>ISBN-13</div>
            {/* <div className='col-1 hide-md'>ISBN-10</div> */}
            <div className='col col-lg-1 hide-sm'>Creato da</div>
            <div className='col col-lg-1 hide-sm'>Creato</div>
            <div className='col col-lg-1'>Modificato da</div>
            <div className='col col-lg-1 text-right'>Modificato</div>
          </div>
        </li>
        {itemsList}
      </ul>
      
      <PaginationControls 
        count={count} 
        fetch={fetch}
        forceVisibility
        limit={limit}
        page={page}
      />

      {isOpenDeleteDialog && (
        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>Procedere con l&apos;eliminazione?</DialogTitle>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>Annulla</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>Procedi</button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
};

export default BooksDash;