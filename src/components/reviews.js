import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewersGroupRef, reviewersRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType, numberType, oneOfType, stringType, arrayType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import PaginationControls from './paginationControls';
import Review from './review';
import '../css/reviews.css';

const desc = true;

const Reviews = ({ bid, container, limit, pagination, skeleton, uid }) => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [items, setItems] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const is = useRef(true);

  const qop = useMemo(() => typeof uid === 'string' ? '==' : 'in', [uid]);

  const ref = useMemo(() => bid ? reviewersRef(bid) : uid ? (
    reviewersGroupRef.where('createdByUid', qop, uid) 
  ) : reviewersGroupRef, [bid, qop, uid]);
  
  const setEmptyState = useCallback(err => {
    setItems(null);
    setLoading(false);
    setLastVisible(null);
    setPage(1);
    if (err) openSnackbar(handleFirestoreError(err), 'error');
  }, [openSnackbar]);

  const fetch = useCallback(() => {
    ref.onSnapshot(fullSnap => { // TODO: remove fullSnap
      // console.log(fullSnap);
      if (!fullSnap.empty) {
        if (is.current) setCount(fullSnap.size);

        ref.orderBy('created_num', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
          const items = [];
          if (!snap.empty) {
            snap.forEach(item => items.push(item.data()));
            if (is.current) {
              setItems(items);
              setLoading(false);
              setLastVisible(snap.docs[snap.docs.length - 1]);
            }
          }
        }).catch(err => {
          if (is.current) setEmptyState(err);
        });
      } else if (is.current) setEmptyState();
    }, err => console.warn(err));
  }, [limit, ref, setEmptyState]);

  const fetchNext = useCallback(() => {
    if (is.current) setLoading(true);
    
		ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setLoading(false);
          setPage((page * limit) > count ? page : page + 1);
          setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
        }
      } else if (is.current) {
        if (is.current) setEmptyState();
      }
		}).catch(err => {
      if (is.current) setEmptyState(err);
    });
  }, [count, items, lastVisible, limit, page, ref, setEmptyState]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const skeletons = [...Array(limit)].map((e, i) => <div key={i} className="skltn review" />);
  
  if (loading && !items && !skeleton) {
    return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>;
  }

  const EmptyState = () => (
    <div className="info-row empty text-center">
      Nessuna recensione<span className="hide-xs"> trovata</span>{!isAuth && !uid && <span>. <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per aggiungerne una.</span>}
    </div>
  );

  return (
    <>
      <div className={`reviews ${container ? 'card dark' : ''}`} ref={is}>
        {!loading && !items ? <EmptyState /> : (
          <>
            {!bid && (
              <div className="head">
                <h2>Ultime recensioni<span className="counter">({items ? items.length : limit} di {count || limit})</span></h2>
              </div>
            )}
            {items?.map(item => (
              <Review 
                key={`${item.bid}-${item.createdByUid}`}
                bid={bid}
                uid={typeof uid === 'string' ? uid : null}
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
}

Reviews.propTypes = {
  bid: stringType,
  container: boolType,
  limit: numberType,
  pagination: boolType,
  skeleton: boolType,
  uid: oneOfType([
    stringType,
    arrayType
  ])
}

Reviews.defaultProps = {
  bid: null,
  container: true,
  limit: 5,
  pagination: true,
  skeleton: false,
  uid: null
}
 
export default Reviews;