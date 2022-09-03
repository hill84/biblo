import { DocumentData, FirestoreError, Query } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import classnames from 'classnames';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import { Link, Redirect } from 'react-router-dom';
import { auth, authorFollowerRef, collectionFollowersRef, commentersGroupRef, countRef, followersGroupRef, genreFollowerRef, noteRef, notesRef, reviewerCommenterRef, reviewerRef, reviewersGroupRef, userNotificationsRef, userRef, usersRef } from '../../../config/firebase';
import icon from '../../../config/icons';
import { asyncForEach, dateOptions, getInitials, handleFirestoreError, timeOptions } from '../../../config/shared';
import SnackbarContext, { SnackbarContextModel } from '../../../context/snackbarContext';
import { CurrentTarget, NoteModel, OrderByModel, UserModel } from '../../../types';
import CopyToClipboard from '../../copyToClipboard';
import PaginationControls from '../../paginationControls';

const limitBy: number[] = [15, 25, 50, 100, 250, 500];

let itemsFetch: (() => void) | undefined;

interface SelectedModel {
  displayName: string;
  email: string;
  uid: string;
}

interface StateModel {
  count: number;
  desc: boolean;
  firstVisible: DocumentData | null;
  items: UserModel[];
  lastVisible: DocumentData | null;
  limitByIndex: number;
  limitMenuAnchorEl?: Element;
  loading: boolean;
  orderByIndex: number;
  orderMenuAnchorEl?: Element;
  page: number;
  redirectTo: string;
  selected: SelectedModel | null;
}

const initialState: StateModel = {
  count: 0,
  desc: true,
  firstVisible: null,
  items: [],
  lastVisible: null,
  limitByIndex: 0,
  limitMenuAnchorEl: undefined,
  loading: true,
  orderByIndex: 0,
  orderMenuAnchorEl: undefined,
  page: 1,
  redirectTo: '',
  selected: null,
};

interface UsersDashProps {
  onToggleDialog: (item?: UserModel | undefined) => void;
  onToggleNoteDialog: (id?: string | undefined, el?: string | undefined) => void;
}

const UsersDash: FC<UsersDashProps> = ({
  onToggleDialog,
  onToggleNoteDialog
}: UsersDashProps) => {
  const { openSnackbar } = useContext<SnackbarContextModel>(SnackbarContext);
  const [count, setCount] = useState<StateModel['count']>(initialState.count);
  const [desc, setDesc] = useState<StateModel['desc']>(initialState.desc);
  const [firstVisible, setFirstVisible] = useState<StateModel['firstVisible']>(initialState.firstVisible);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [items, setItems] = useState<StateModel['items']>(initialState.items);
  const [lastVisible, setLastVisible] = useState<StateModel['lastVisible']>(initialState.lastVisible);
  const [limitByIndex, setLimitByIndex] = useState<number>(initialState.limitByIndex);
  const [limitMenuAnchorEl, setLimitMenuAnchorEl] = useState<StateModel['limitMenuAnchorEl']>(initialState.limitMenuAnchorEl);
  const [orderByIndex, setOrderByIndex] = useState<StateModel['orderByIndex']>(initialState.orderByIndex);
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState<StateModel['orderMenuAnchorEl']>(initialState.orderMenuAnchorEl);
  const [loading, setLoading] = useState<StateModel['loading']>(initialState.loading);
  const [page, setPage] = useState<StateModel['page']>(initialState.page);
  const [redirectTo, setRedirectTo] = useState<StateModel['redirectTo']>(initialState.redirectTo);
  const [selected, setSelected] = useState<StateModel['selected']>(initialState.selected);

  const { t } = useTranslation(['common', 'form']);
  
  const orderBy: OrderByModel[] = [ 
    { type: 'creationTime', label: 'Data' }, 
    { type: 'displayName', label: t('form:LABEL_DISPLAY_NAME') }, 
    { type: 'uid', label: 'Uid' }, 
    { type: 'email', label: t('form:LABEL_EMAIL') },
    { type: 'stats.shelf_num', label: t('form:LABEL_BOOKS') },
    { type: 'stats.wishlist_num', label: t('WISHES') },
    { type: 'stats.reviews_num', label: t('REVIEWS') },
    { type: 'stats.ratings_num', label: t('RATINGS') },
  ];

  const limit: number = limitBy[limitByIndex];
  const order: OrderByModel = orderBy[orderByIndex];

  const fetcher = useCallback(() => {
    const ref: Query<DocumentData> = usersRef.orderBy(order.type, desc ? 'desc' : 'asc').limit(limit);

    setLoading(true);
    itemsFetch = ref.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: UserModel[] = [];
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
    const ref: Query<DocumentData> = usersRef.orderBy(order.type, desc === prev ? 'asc' : 'desc').limit(limit);
    const paginatedRef: Query<DocumentData> = ref.startAfter(prev ? firstVisible : lastVisible);

    itemsFetch = paginatedRef.onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const items: UserModel[] = [];
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
    countRef('users').get().then((fullSnap: DocumentData): void => {
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

  const onDeleteSuccess = useCallback((msg: string): void => {
    console.log(`%c✔ ${msg} deleted`, 'color: green');
    openSnackbar(`${msg} deleted`, 'success');
  }, [openSnackbar]);

  const onDeleteError = useCallback((msg: string, err: FirestoreError): void => {
    console.log(`%c✖ ${msg} not deleted`, 'color: red');
    openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const onToggleDesc = (): void => setDesc(!desc);
  
  const onOpenOrderMenu = (e: MouseEvent): void => setOrderMenuAnchorEl(e.currentTarget as Element);
  const onCloseOrderMenu = (): void => setOrderMenuAnchorEl(undefined);
  const onChangeOrderBy = (i: number): void => {
    setOrderMenuAnchorEl(undefined);
    setOrderByIndex(i);
    setPage(initialState.page);
  };

  const onOpenLimitMenu = (e: MouseEvent): void => setLimitMenuAnchorEl(e.currentTarget as Element);
  const onCloseLimitMenu = (): void => setLimitMenuAnchorEl(undefined);
  const onChangeLimitBy = (i: number): void => {
    setLimitMenuAnchorEl(undefined);
    setLimitByIndex(i);
    setPage(initialState.page);
  };

  const onView = (e: MouseEvent): void => {
    const { uid } = (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    setRedirectTo(uid);
  };

  const onNote = (e: MouseEvent): void => {
    const { uid } =  (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    onToggleNoteDialog(uid);
  };

  const onSendReset = (e: MouseEvent): void => {
    const { email } =  (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    auth.sendPasswordResetEmail(email).then((): void => {
      openSnackbar('Email inviata', 'success');
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  };

  // const onSendVerification = (): void => {}; // TODO

  const onEdit = (item: UserModel): void => onToggleDialog(item);

  const onLock = (e: MouseEvent): void => {
    const { uid } =  (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    const state =  (e.currentTarget as CurrentTarget).parentNode?.dataset?.state === 'true';
    // console.log(`${state ? 'Un' : 'L'}ocking ${id}`);
    userRef(uid).update({ 'roles.editor': !state }).then((): void => {
      openSnackbar(t(`form:${state ? 'SUCCESS_LOCKED_ITEM' : 'SUCCESS_UNLOCKED_ITEM'}`), 'success');
    }).catch((err: FirestoreError): void => {
      openSnackbar(handleFirestoreError(err), 'error');
    });
  };

  const onDeleteRequest = (e: MouseEvent): void => {
    const { displayName, email, uid } =  (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    setIsOpenDeleteDialog(true);
    setSelected({ displayName, email, uid });
  };
  const onCloseDeleteDialog = (): void => {
    setIsOpenDeleteDialog(false);
    setSelected(null);
  };
  const onDelete = useCallback((): void => {
    setIsOpenDeleteDialog(false);
    if (!selected) return;

    const { uid } = selected;
    
    userRef(uid).delete().then((): void => onDeleteSuccess('User')).catch((err: FirestoreError): void => onDeleteError('User', err));

    reviewersGroupRef.where('createdByUid', '==', uid).get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        snap.forEach((item: DocumentData): void => {
          // console.log(`• review deleted`);
          const { bid, createdByUid } = item.data();
          reviewerRef(bid, createdByUid).delete().catch((err: FirestoreError): void => onDeleteError(`Review ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} reviews`);
      }
    }).catch((err: FirestoreError): void => onDeleteError('Reviews', err));

    commentersGroupRef.where('createdByUid', '==', uid).get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        snap.forEach((item: DocumentData): void => {
          // console.log(`• comment deleted`);
          const { bid, createdByUid, rid } = item.data();
          reviewerCommenterRef(bid, rid, createdByUid).delete().catch((err: FirestoreError): void => onDeleteError(`Comment ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} comments`);
      }
    }).catch((err: FirestoreError): void => onDeleteError('Comments', err));

    followersGroupRef.where('uid', '==', uid).get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        snap.forEach((item: DocumentData): void => {
          const { aid, cid, gid, uid } = item.data();
          // console.log(`• ${aid ? 'author' : cid ? 'collection' : gid ? 'genre' : 'unknow'} deleted`);
          if (aid) authorFollowerRef(aid, uid).delete().catch((err: FirestoreError): void => onDeleteError(`Author follow ${item.id}`, err));
          if (gid) genreFollowerRef(gid, uid).delete().catch((err: FirestoreError): void => onDeleteError(`Genre follow ${item.id}`, err));
          if (cid) collectionFollowersRef(cid).doc(uid).delete().catch((err: FirestoreError): void => onDeleteError(`Collection follow ${item.id}`, err));
        });
        onDeleteSuccess(`${snap.docs.length} follows`);
      }
    }).catch((err: FirestoreError): void => onDeleteError('Follows', err));

    userNotificationsRef(uid).get().then((snap: DocumentData): void => {
      if (!snap.empty) {
        notesRef(uid).get().then((snap: DocumentData): void => {
          if (!snap.empty) {
            if (snap.docs.length < 1000) {
              const notes: NoteModel[] = [];
              snap.forEach((item: DocumentData): number => notes.push(item.id));
              // console.log(notes);
              (async (): Promise<void> => {
                await asyncForEach(snap.docs, (item: DocumentData): void => {
                  noteRef(uid, item.id).delete().then((): void => {
                    // console.log(`• note ${item.id} deleted`);
                  }).catch((err: FirestoreError): void => onDeleteError(`• note ${item.id}`, err));
                });

                onDeleteSuccess(`${snap.docs.length} notes`);

                userNotificationsRef(uid).delete().then((): void => {
                  onDeleteSuccess('Notifications collection');
                }).catch((err: FirestoreError): void => onDeleteError('Notifications collection', err));
              })();
            } else console.warn('Operation aborted: too many docs');
          } else console.log('No notes');
        }).catch((err: FirestoreError): void => onDeleteError('Notes', err));
      } else console.log('No notifications collection');
    }).catch((err: FirestoreError): void => onDeleteError('Notifications', err));
    
    onCloseDeleteDialog();
  }, [onDeleteError, onDeleteSuccess, selected]);

  const onChangeRole = (e: MouseEvent): void => {
    const { uid } =  (e.currentTarget as CurrentTarget).parentNode?.dataset || {};
    if (!uid) return;
    const { role, state } = (e.currentTarget as CurrentTarget).dataset || {};
    if (!role) return;
    const prevState = state === 'true';
    userRef(uid).update({ [`roles.${role}`]: !prevState }).catch((err: FirestoreError): void => console.warn(err));
  };

  if (redirectTo) return (
    <Redirect to={`/dashboard/${redirectTo}`} />
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
  
  const skeletons = [...Array(limit)].map((_e, i: number) => <li key={i} className='avatar-row skltn dash' />);
  
  const itemsList = loading ? skeletons : !items ? (
    <li className='empty text-center'>
      {t('EMPTY_LIST')}
    </li>
  ) : (
    items.map((item: UserModel) => (
      <li key={item.uid} className={classnames('avatar-row', item.roles?.editor ? 'editor' : 'locked')}>
        <div className='row'>
          <div className='col-auto avatar-container'>
            <Avatar className='avatar'>
              {item.photoURL ? (
                <Zoom overlayBgColorEnd='rgba(var(--canvasClr), .8)' zoomMargin={10}>
                  <img alt={item.displayName} src={item.photoURL} className='avatar thumb' />
                </Zoom>
              ) : getInitials(item.displayName)}
            </Avatar>
          </div>
          <Link to={`/dashboard/${item.uid}`} className='col col-lg-2' title={item.displayName}>
            {item.displayName} {item.roles?.author && icon.checkDecagram}
          </Link>
          <div className='col monotype hide-sm'>
            <CopyToClipboard text={item.uid} />
          </div>
          <div className='col monotype hide-sm'>
            <CopyToClipboard text={item.email} />
          </div>
          <div role='group' className='col col-md-2 col-lg-1 btns xs rounded text-center' data-uid={item.uid}>
            <button type='button' className={classnames('btn', { flat: !item.roles?.editor })} data-role='editor' data-state={item.roles?.editor} onClick={onChangeRole} title='editor'>E</button>
            <button type='button' className={classnames('btn', { flat: !item.roles?.premium })} data-role='premium' data-state={item.roles?.premium} onClick={onChangeRole} title='premium'>P</button>
            <button type='button' className={classnames('btn', { flat: !item.roles?.admin })} data-role='admin' data-state={item.roles?.admin} onClick={onChangeRole} title='admin'>A</button>
          </div>
          <div className='col col-sm-3 hide-xs'>
            <div className='row text-center monotype'>
              <div className={classnames('col', { 'lightest-text': !item.stats?.shelf_num })}>{item.stats?.shelf_num}</div>
              <div className={classnames('col', { 'lightest-text': !item.stats?.wishlist_num })}>{item.stats?.wishlist_num}</div>
              <div className={classnames('col', { 'lightest-text': !item.stats?.reviews_num })}>{item.stats?.reviews_num}</div>
              <div className={classnames('col', 'hide-md', { 'lightest-text': !item.stats?.ratings_num })}>{item.stats?.ratings_num}</div>
              <div className={classnames('col', 'hide-md', { 'lightest-text': !item.termsAgreement })} title={item.termsAgreement ? new Date(item.termsAgreement).toLocaleString() : ''}>{icon[item.termsAgreement ? 'check' : 'close']}</div>
              <div className={classnames('col', 'hide-md', { 'lightest-text': !item.privacyAgreement })} title={item.privacyAgreement ? new Date(item.privacyAgreement).toLocaleString() : ''}>{icon[item.privacyAgreement ? 'check' : 'close']}</div>
            </div>
          </div>
          <div className='col col-sm-2 col-lg-1 text-right'>
            <div className='timestamp'>
              <span className='date'>{new Date(item.creationTime).toLocaleDateString('it-IT', dateOptions)}</span><span className='time hide-lg'> &middot; {new Date(item.creationTime).toLocaleTimeString('it-IT', timeOptions)}</span>
            </div>
          </div>
          <div className='absolute-row right btns xs'
            data-display-name={item.displayName}
            data-email={item.email}
            data-state={item.roles?.editor}
            data-uid={item.uid}>
            <button
              type='button'
              className='btn icon green'
              title={t('ACTION_PREVIEW')}
              onClick={onView}>
              {icon.eye}
            </button>
            <button
              type='button'
              className='btn icon primary'
              title={t('ACTION_EDIT')}
              onClick={() => onEdit(item)}>
              {icon.pencil}
            </button>
            <button
              type='button'
              className='btn icon primary'
              title={t('ACTION_SEND_NOTIFICATION')}
              onClick={onNote}>
              {icon.bell}
            </button>
            {/* 
              <button
                type='button'
                className='btn icon primary'
                title='Invia email di verifica'
                onClick={onSendVerification}>
                {icon.email}
              </button>
            */}
            <button
              type='button'
              className='btn icon primary'
              title={t('ACTION_SEND_RESET_PASSWORD_EMAIL')}
              onClick={onSendReset}>
              {icon.textboxPassword}
            </button>
            <button
              type='button'
              className={classnames('btn', 'icon', item.roles?.editor ? 'secondary' : 'flat')}
              title={t(item.roles?.editor ? 'ACTION_LOCK' : 'ACTION_UNLOCK')}
              onClick={onLock}>
              {icon.lock}
            </button>
            <button
              type='button'
              className='btn icon red'
              onClick={onDeleteRequest}
              title={t('ACTION_DELETE')}>
              {icon.close}
            </button>
          </div>
        </div>
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
              onClick={onOpenLimitMenu}
            >
              {limitBy[limitByIndex]} <span className='hide-xs'>{t('PER_PAGE')}</span>
            </button>
            <Menu 
              className='dropdown-menu'
              anchorEl={limitMenuAnchorEl} 
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
                onClick={onOpenOrderMenu}
              >
                <span className='hide-xs'>{t('SORT_BY')}</span> {orderBy[orderByIndex].label}
              </button>
              <button
                type='button'
                className={classnames('btn', 'sm', 'flat', 'counter', 'icon', 'rounded', desc ? 'desc' : 'asc')}
                title={t(desc ? 'ASCENDING' : 'DESCENDING')}
                onClick={onToggleDesc}
              >
                {icon.arrowDown}
              </button>
              <Menu 
                className='dropdown-menu'
                anchorEl={orderMenuAnchorEl} 
                open={Boolean(orderMenuAnchorEl)} 
                onClose={onCloseOrderMenu}>
                {orderByOptions}
              </Menu>
            </div>
          )}
        </div>
      </div>

      <ul className='table dense nolist font-sm'>
        <li className='avatar-row labels'>
          <div className='row'>
            <div className='col-auto'><div className='avatar hidden' title='avatar' /></div>
            <div className='col col-lg-2'>{t('form:LABEL_DISPLAY_NAME')}</div>
            <div className='col hide-sm'>Uid</div>
            <div className='col hide-sm'>{t('form:LABEL_EMAIL')}</div>
            <div className='col col-md-2 col-lg-1 text-center'>{t('ROLES')}</div>
            <div className='col col-sm-3 hide-xs'>
              <div className='row text-center'>
                <div className='col' title={t('BOOKS')}>{icon.book}</div>
                <div className='col' title={t('WISHES')}>{icon.heart}</div>
                <div className='col' title={t('REVIEWS')}>{icon.review}</div>
                <div className='col hide-md' title={t('RATINGS')}>{icon.star}</div>
                <div className='col hide-md' title={t('TERMS')}>{icon.clipboardCheck}</div>
                <div className='col hide-md' title='Privacy'>{icon.shieldAccount}</div>
              </div>
            </div>
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

      {selected && (
        <Dialog
          open={isOpenDeleteDialog}
          keepMounted
          onClose={onCloseDeleteDialog}
          aria-labelledby='delete-dialog-title'
          aria-describedby='delete-dialog-description'>
          <DialogTitle id='delete-dialog-title'>
            {t('DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='delete-dialog-description'>
              <span dangerouslySetInnerHTML={{ __html: t('DIALOG_REMOVE_USER_PARAGRAPH', {
                displayName: `<b>${selected.displayName}</b>`,
                uid: `<small className='monotype'>${selected.uid}</small>` 
              })}} />
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer flex no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseDeleteDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onDelete}>{t('ACTION_PROCEED')}</button>
          </DialogActions>
        </Dialog>
      )}
    </Fragment>
  );
};
 
export default UsersDash;