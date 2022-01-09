import { CollectionReference, DocumentData, FirestoreError } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import classnames from 'classnames';
import React, { FC, Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionsRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/discussions.css';
import { DiscussionModel } from '../types';
import Discussion from './discussion';
import PaginationControls from './paginationControls';

const desc = true;

interface DiscussionsProps {
  container?: boolean;
  gid?: string;
  limit?: number;
  pagination?: boolean;
  skeleton?: boolean;
  uid?: string | string[];
}

interface StateModel {
  items: DiscussionModel[];
  count: number;
  loading: boolean;
  page: number;
  lastVisible: DocumentData | null;
}

const initialState: StateModel = {
  items: [],
  count: 0,
  loading: false,
  page: 1,
  lastVisible: null,
};

const Discussions: FC<DiscussionsProps> = ({
  container = true,
  gid,
  limit = 5,
  pagination = true,
  skeleton = false,
  uid,
}: DiscussionsProps) => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [items, setItems] = useState<DiscussionModel[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);

  const ref: CollectionReference<DocumentData> | undefined = useMemo(() => gid ? groupDiscussionsRef(gid) : undefined, [gid]);
  
  const setEmptyState = useCallback((err?: FirestoreError): void => {
    setItems(initialState.items);
    setLoading(initialState.loading);
    setLastVisible(initialState.lastVisible);
    setPage(initialState.page);
    if (err) openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const fetch = useCallback(() => {
    if (ref) {
      setLoading(true);
      ref.onSnapshot((fullSnap: DocumentData): void => { // TODO: remove fullSnap
        // console.log(fullSnap);
        if (!fullSnap.empty) {
          setCount(fullSnap.size);
          ref.orderBy('created_num', desc ? 'desc' : 'asc').limit(limit).get().then((snap: DocumentData): void => {
            const items: DiscussionModel[] = [];
            if (!snap.empty) {
              snap.forEach((item: DocumentData): number => items.push(item.data()));
              setItems(items);
              setLastVisible(snap.docs[snap.docs.length - 1]);
            }
          }).catch((err: FirestoreError): void => {
            setEmptyState(err);
          }).finally((): void => {
            setLoading(false);
          });
        } else setEmptyState();
      });
    } else console.log('No ref');
  }, [limit, ref, setEmptyState]);

  const fetchNext = useCallback(() => {
    if (ref) {
      setLoading(true);
      ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then((nextSnap: DocumentData): void => {
        if (!nextSnap.empty) {
          nextSnap.forEach((item: DocumentData): number => items.push(item.data()));
          setItems(items);
          setPage(initialState.page); // (page * limit) > count ? page : page + 1
          setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
        } else {
          setEmptyState();
        }
      }).catch((err: FirestoreError): void => {
        setEmptyState(err);
      }).finally((): void => {
        setLoading(false);
      });
    } else console.log('No ref');
  }, [/* count,  */items, lastVisible, limit, ref, setEmptyState]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const skeletons = [...Array(limit)].map((_e: number, i: number) => <div key={i} className="skltn discussion" />);
  
  if (loading && !items && !skeleton) {
    return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>;
  }

  const EmptyState = () => (
    <div className="info-row empty text-center">
      Nessun commento<span className="hide-xs"> trovato</span>{!isAuth && !uid && <span>. <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per aggiungerne uno.</span>}
    </div>
  );

  return (
    <Fragment>
      <div className={classnames('discussions', { 'card dark': container })}>
        {!loading && !items.length ? <EmptyState /> : (
          <Fragment>
            {items.map((item: DiscussionModel) => (
              <Discussion 
                key={item.did}
                discussion={item} 
                gid={gid}
              />
            ))}
            {loading && skeleton && skeletons}
          </Fragment>
        )}
      </div>
      {pagination && count > 0 && items.length < count && (
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      )}
    </Fragment>
  );
};

export default Discussions;