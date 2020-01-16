import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewersGroupRef, reviewersRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import PaginationControls from './paginationControls';
import Review from './review';

const desc = true;

const Reviews = props => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { bid, container, limit, pagination, skeleton, uid } = props;
  const [items, setItems] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const is = useRef(true);

  const fetch = useCallback(() => {
    const ref = bid ? reviewersRef(bid) : uid ? reviewersGroupRef.where('createdByUid', '==', uid) : reviewersGroupRef;
    const setEmptyState = err => {
      setItems(null);
      setLoading(false);
      setLastVisible(null);
      if (err) openSnackbar(handleFirestoreError(err), 'error');
    };
  
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
              setLastVisible(snap.docs[snap.docs.length-1]);
            }
          }
        }).catch(err => {
          if (is.current) setEmptyState(err);
        });
      } else if (is.current) setEmptyState();
    });
  }, [bid, limit, openSnackbar, uid]);

  const fetchNext = useCallback(() => {
    const ref = bid ? reviewersRef(bid) : uid ? reviewersGroupRef.where('createdByUid', '==', uid) : reviewersGroupRef;

    if (is.current) setLoading(true);
    
		ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setLoading(false);
          setPage((page * limit) > count ? page : page + 1);
          setLastVisible(nextSnap.docs[nextSnap.docs.length-1] || lastVisible);
        }
      } else if (is.current) {
        setItems(null);
        setLoading(false);
        setPage(null);
        setLastVisible(null);
      }
		}).catch(err => {
      if (is.current) setLoading(false);
      openSnackbar(handleFirestoreError(err), 'error');
    });
  }, [bid, count, items, lastVisible, limit, openSnackbar, page, uid]);

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
        {!loading && !items ? <EmptyState /> :
          <>
            {!bid && (
              <div className="head">
                <h2>Ultime recensioni<span className="counter">({items ? items.length : limit} di {count || limit})</span></h2>
              </div>
            )}
            {items && items.map(item => (
              <Review 
                key={item.createdByUid}
                bid={bid}
                uid={uid}
                review={item} 
              />
            ))}
            {loading && skeleton && skeletons}
          </>
        }
      </div>
      {pagination && count > 0 && items && items.length < count &&
        <PaginationControls 
          count={count} 
          fetch={fetchNext} 
          limit={limit}
          loading={loading}
          oneWay
          page={page}
        />
      }
    </>
  );
}

Reviews.propTypes = {
  bid: stringType,
  container: boolType,
  limit: numberType,
  pagination: boolType,
  skeleton: boolType,
  uid: stringType
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