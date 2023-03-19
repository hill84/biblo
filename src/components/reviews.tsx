import type { DocumentData, FirestoreError, Query, WhereFilterOp } from '@firebase/firestore-types';
import CircularProgress from '@material-ui/core/CircularProgress';
import classnames from 'classnames';
import type { FC } from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { reviewersGroupRef, reviewersRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import type { SnackbarContextModel } from '../context/snackbarContext';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/reviews.css';
import type { ReviewModel, UserContextModel } from '../types';
import PaginationControls from './paginationControls';
import Review from './review';

const desc = true;

interface ReviewsProps {
  bid?: string;
  container?: boolean;
  limit?: number;
  pagination?: boolean;
  skeleton?: boolean;
  uid?: string | string[];
}

interface StateModel {
  items: ReviewModel[];
  count: number;
  lastVisible: DocumentData | null;
  loading: boolean;
  page: number;
}

const initialState: StateModel = {
  items: [],
  count: 0,
  lastVisible: null,
  loading: false,
  page: 1,
};

const Reviews: FC<ReviewsProps> = ({
  bid,
  container = true,
  limit = 5,
  pagination = true,
  skeleton = false,
  uid
}: ReviewsProps) => {
  const { isAuth } = useContext<UserContextModel>(UserContext);
  const { openSnackbar } = useContext<SnackbarContextModel>(SnackbarContext);
  const [items, setItems] = useState<ReviewModel[]>(initialState.items);
  const [count, setCount] = useState<number>(initialState.count);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [page, setPage] = useState<number>(initialState.page);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(initialState.lastVisible);

  const { t } = useTranslation(['common']);

  const ref = useMemo((): Query<DocumentData> => {
    const qop: WhereFilterOp = typeof uid === 'string' ? '==' : 'in';
    const creationThreshold: number = new Date().getTime() - 1_800_000; // now - 30 minutes
    return bid ? reviewersRef(bid) : uid ? reviewersGroupRef.where('createdByUid', qop, uid) : reviewersGroupRef.where('created_num', '<', creationThreshold);
  }, [bid, uid]);
  
  const setEmptyState = useCallback((err?: FirestoreError): void => {
    setItems(initialState.items);
    setLoading(initialState.loading);
    setLastVisible(initialState.lastVisible);
    setPage(initialState.page);
    if (err) openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const fetch = useCallback(() => {
    setLoading(true);
    ref.onSnapshot((fullSnap: DocumentData): void => { // TODO: remove fullSnap
      // console.log(fullSnap);
      if (!fullSnap.empty) {
        setCount(fullSnap.size);

        ref.orderBy('created_num', desc ? 'desc' : 'asc').limit(limit).get().then((snap: DocumentData): void => {
          const items: ReviewModel[] = [];
          if (!snap.empty) {
            snap.forEach((item: DocumentData): number => items.push(item.data()));
            setItems(items);
            setLoading(false);
            setLastVisible(snap.docs[snap.docs.length - 1]);
          }
        }).catch((err: FirestoreError): void => {
          setEmptyState(err);
        });
      } else setEmptyState();
    }, (err: Error): void => console.warn(err));
  }, [limit, ref, setEmptyState]);

  const fetchNext = useCallback(() => {
    setLoading(true);
    
    ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach((item: DocumentData): number => items.push(item.data()));
        setItems(items);
        setLoading(false);
        setPage((page * limit) > count ? page : page + 1);
        setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
      } else {
        setEmptyState();
      }
    }).catch((err: FirestoreError): void => {
      setEmptyState(err);
    });
  }, [count, items, lastVisible, limit, page, ref, setEmptyState]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const skeletons = [...Array(limit)].map((_e, i: number) => <div key={i} className='skltn review' />);
  
  if (loading && !items && !skeleton) {
    return <div aria-hidden='true' className='loader relative'><CircularProgress /></div>;
  }

  const EmptyState = () => (
    <div className='info-row empty text-center'>
      {t('NO_REVIEWS')}{!isAuth && !uid && <span>. <Link to='/login'>{t('ACTION_LOGIN')}</Link> {t('OR')} <Link to='/signup'>{t('ACTION_SIGNUP').toLowerCase()}</Link> per aggiungerne una.</span>}
    </div>
  );

  return (
    <>
      <div className={classnames('reviews', { ['card dark'] : container })}>
        {!loading && !items.length ? <EmptyState /> : (
          <>
            {!bid && (
              <div className='head'>
                <h2>{t('LAST_REVIEWS')}<span className='counter'>({items.length || limit} {t('OF')} {count || limit})</span></h2>
              </div>
            )}
            {items?.map((item: ReviewModel) => (
              <Review 
                key={`${item.bid}-${item.createdByUid}`}
                bid={bid}
                uid={typeof uid === 'string' ? uid : undefined}
                review={item} 
              />
            ))}
            {loading && skeleton && skeletons}
          </>
        )}
      </div>
      {pagination && count > 0 && items?.length < count && (
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      )}
    </>
  );
};
 
export default Reviews;