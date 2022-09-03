import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import DOMPurify from 'dompurify';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countRef, noteRef, /* notesGroupRef, */ notesRef, notificationsRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { handleFirestoreError, timeSince } from '../../../config/shared';
// import { Redirect } from 'react-router-dom';
import SnackbarContext from '../../../context/snackbarContext';
import useToggle from '../../../hooks/useToggle';
import { CurrentTarget, NoteModel, OrderByModel } from '../../../types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

interface NoteDashModel {
  id: string;
  count: number;
  notes?: NoteModel[];
}

const limitBy: number[] = [15, 25, 50, 100, 250, 500];

let itemsFetch: (() => void) | undefined;
let subItemsFetch: (() => void) | undefined;

interface NotesDashProps {
  onToggleDialog: (id?: string, el?: string) => void;
}

interface StateModel {
  count: number;
  desc: boolean;
  firstVisible: DocumentData | null;
  isOpenDeleteDialog: boolean;
  items: NoteDashModel[];
  lastVisible: DocumentData | null;
  limitByIndex: number;
  limitMenuAnchorEl?: Element;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl?: Element;
  page: number;
  selectedEl: string;
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
  selectedEl: '',
  selectedId: '',
};

const NotesDash: FC<NotesDashProps> = ({ onToggleDialog }: NotesDashProps) => {
  const [count, setCount] = useState<StateModel['count']>(initialState.count);
  const [desc, onToggleDesc] = useToggle(initialState.desc);
  const [firstVisible, setFirstVisible] = useState<StateModel['firstVisible']>(initialState.firstVisible);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<StateModel['isOpenDeleteDialog']>(initialState.isOpenDeleteDialog);
  const [items, setItems] = useState<StateModel['items']>(initialState.items);
  const [lastVisible, setLastVisible] = useState<StateModel['lastVisible']>(initialState.lastVisible);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState<StateModel['limitMenuAnchorEl']>(initialState.limitMenuAnchorEl);
  const [limitByIndex, setLimitByIndex] = useState<number>(initialState.limitByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);
  // const [redirectTo, setRedirectTo] = useState<StateModel['redirectTo']>(initialState.redirectTo);
  const [selectedEl, setSelectedEl] = useState<StateModel['selectedEl']>(initialState.selectedEl);
  const [selectedId, setSelectedId] = useState<StateModel['selectedId']>(initialState.selectedId);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading);

  const { openSnackbar } = useContext(SnackbarContext);

  const { t } = useTranslation(['common']);

  const orderBy = useMemo((): OrderByModel[] => [ 
    { type: 'count', label: t('COUNT') },
  ], [t]);

  const limit: number = limitBy[limitByIndex];
  // const orderByIndex: StateModel['orderByIndex'] = initialState.orderByIndex;
  const order: OrderByModel = orderBy[orderByIndex];

  const fetcher = useCallback(() => {
    const ref: Query<DocumentData> = notificationsRef.orderBy(order.type, desc ? 'desc' : 'asc').limit(limit);

    setLoading(true);
    itemsFetch = ref.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: NoteDashModel[] = [];
        snap.forEach((item: DocumentData): number => items.push({ id: item.id, count: item.data().count }));
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
    const ref: Query<DocumentData> = notificationsRef.orderBy(order.type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef: Query<DocumentData> = ref.startAfter(prev ? firstVisible : lastVisible);

    itemsFetch = paginatedRef.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: NoteDashModel[] = [];
        snap.forEach((item: DocumentData) => items.push({ id: item.id, count: item.data().count }));
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
    countRef('notifications').get().then((fullSnap: DocumentData): void => {
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
    subItemsFetch?.();
  }, []);

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

  // const onView = ({ id }: { id: string }): void => setRedirectTo(id);

  const onEdit = ({ id, el }: { id: string; el: string }): void => onToggleDialog(id, el);

  const onDeleteRequest = ({ id, el }: { id: string; el: string }): void => {
    setIsOpenDeleteDialog(true);
    setSelectedId(id);
    setSelectedEl(el);
  };

  const onCloseDeleteDialog = (): void => {
    setIsOpenDeleteDialog(false);
    setSelectedId('');
    setSelectedEl('');
  };

  const onDelete = (): void => {
    setIsOpenDeleteDialog(false);
    noteRef(selectedId, selectedEl).delete().then((): void => {
      openSnackbar(t('SUCCESS_DELETED_ITEM'), 'success');
    }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
  };

  const onToggleExpansion = (id: string): void => {
    if (id) {
      setSelectedId(id);
      const selectedObj: number = items.findIndex((obj: NoteDashModel): boolean => obj.id === id);
      subItemsFetch = notesRef(id).orderBy('created_num', 'desc').limit(200).onSnapshot((snap: DocumentData): void => {
        if (!snap.empty) {
          setItems((prev: NoteDashModel[]) => {
            const notes: NoteModel[] = [];
            snap.forEach((note: DocumentData): number => notes.push(note.data()));
            const items: NoteDashModel[] = [...prev];
            items[selectedObj] = { ...items[selectedObj], notes };
            return items;
          });
        }
      });
    } else console.log('No id');
  };

  /* getLastNotes = (limit = 5) => {
    const lRef = notesGroupRef.limit(limit);
    lRef.get().then(snap => {
      if (!snap.empty) {
        const items = [];
        snap.forEach(item => items.push(item.data()));
        console.log(items);
      }
    })
  }

  if (redirectTo) return (
    <Redirect to={`/notifications/${redirectTo}`} />
  ); */

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
    <li className='empty text-center'>
      {t('EMPTY_LIST')}
    </li>
  ) : (
    items.map(({ id, count, notes }: NoteDashModel) => (
      <li 
        key={id} 
        role='treeitem'
        className={classnames('expandible-parent', selectedId === id ? 'expanded' : 'compressed')} 
        onKeyDown={() => onToggleExpansion(id)}
        onClick={() => onToggleExpansion(id)}>
        <div className='row'>
          <div className='col-auto'>{count || 0}</div>
          <div className='col monotype'><CopyToClipboard text={id}/></div>
          <div className='col-1 text-right expandible-icon'>
            {icon.chevronDown}
          </div>
        </div>
        {Boolean(notes?.length) && (
          <ul className='expandible'>
            {notes?.map(({ created_num, nid, read, text }: NoteModel, i: number) => {
              const sanitizedHtml: string = DOMPurify.sanitize(text);
              return (
                <li key={nid} className={read ? 'read' : 'not-read'}>
                  <div className='row'>
                    <div className='col-auto'>{i + 1}</div>
                    <div className='col'><div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /></div>
                    <div className='col-sm-3 col-lg-2 monotype hide-sm text-center'>
                      <CopyToClipboard text={nid} />
                    </div>
                    <div className='col-auto' title={t(read ? 'READ' : 'UNREAD')}>{read ? icon.check : icon.close}</div>
                    <div className='col-auto col-sm-2 col-lg-1 text-right'>
                      <div className='timestamp'>{timeSince(created_num)}</div>
                    </div>
                    <div className='absolute-row right btns xs'>
                      <button
                        type='button'
                        className='btn icon primary'
                        onClick={() => onEdit({ id, el: nid })}
                        title={t('ACTION_EDIT')}>
                        {icon.pencil}
                      </button>
                      <button
                        type='button'
                        className='btn icon red'
                        onClick={() => onDeleteRequest({ id, el: nid })}
                        title={t('ACTION_DELETE')}>
                        {icon.close}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    ))
  );

  return (
    <Fragment>
      <div className='head nav'>
        <div className='row'>
          <div className='col'>
            <span className='counter hide-md'>{`${items.length || 0} ${t('OF')} ${count || 0}`}</span>
            <button
              type='button'
              className='btn sm flat counter last'
              disabled={!items.length}
              onClick={onOpenLimitMenu}>
              {limit} <span className='hide-xs'>{t('PER_PAGE')}</span>
            </button>
            <Menu 
              anchorEl={limitMenuAnchorEl}
              className='dropdown-menu'
              open={Boolean(limitMenuAnchorEl)} 
              onClose={onCloseLimitMenu}>
              {limitByOptions}
            </Menu>
          </div>
          {Boolean(items.length) && (
            <div className='col-auto'>
              <button
                type='button'
                className='btn sm flat counter'
                disabled={orderBy.length === 1}
                onClick={onOpenOrderMenu}>
                <span className='hide-xs'>{t('SORT_BY')}</span> {orderBy[orderByIndex].label}
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
                title={t(desc ? 'ASCENDING' : 'DESCENDING')}
                onClick={onToggleDesc}>
                {icon.arrowDown}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ul className='table dense nolist font-sm dash-table' role='tree'>
        <li className='labels'>
          <div className='row'>
            <div className='col-auto'># </div>
            <div className='col'>Uid</div>
            <div className='col col-sm-2 col-lg-1 text-right'>{t('CREATED')}</div>
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
          <DialogTitle id='delete-dialog-title'>
            {t('DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('ACTION_PROCEED')}</button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
};

export default NotesDash;