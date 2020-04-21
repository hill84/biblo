import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionsRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { arrayType, boolType, numberType, oneOfType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/discussions.css';
import Discussion from './discussion';
import PaginationControls from './paginationControls';

const desc = true;

const Discussions = props => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { container, gid, limit, pagination, skeleton, uid } = props;
  const [items, setItems] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const is = useRef(true);

  const ref = useMemo(() => groupDiscussionsRef(gid), [gid]);
  
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
              setLastVisible(snap.docs[snap.docs.length - 1]);
            }
          }
        }).catch(err => {
          if (is.current) setEmptyState(err);
        }).finally(() => {
          if (is.current) setLoading(false);
        });
      } else if (is.current) setEmptyState();
    });
  }, [limit, ref, setEmptyState]);

  const fetchNext = useCallback(() => {
    if (is.current) setLoading(true);
    
		ref.orderBy('created_num', desc ? 'desc' : 'asc').startAfter(lastVisible).limit(limit).get().then(nextSnap => {
      if (!nextSnap.empty) {
        nextSnap.forEach(item => items.push(item.data()));
        if (is.current) {
          setItems(items);
          setPage(1); // (page * limit) > count ? page : page + 1
          setLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || lastVisible);
        }
      } else if (is.current) {
        if (is.current) setEmptyState();
      }
		}).catch(err => {
      if (is.current) setEmptyState(err);
    }).finally(() => {
      if (is.current) setLoading(false);
    });
  }, [/* count,  */items, lastVisible, limit, ref, setEmptyState]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const skeletons = [...Array(limit)].map((e, i) => <div key={i} className="skltn discussion" />);
  
  if (loading && !items && !skeleton) {
    return <div aria-hidden="true" className="loader relative"><CircularProgress /></div>;
  }

  const EmptyState = () => (
    <div className="info-row empty text-center">
      Nessun commento<span className="hide-xs"> trovato</span>{!isAuth && !uid && <span>. <Link to="/login">Accedi</Link> o <Link to="/signup">registrati</Link> per aggiungerne uno.</span>}
    </div>
  );

  return (
    <>
      <div className={`discussions ${container ? 'card dark' : ''}`} ref={is}>
        {!loading && !items ? <EmptyState /> : (
          <>
            {items?.map(item => (
              <Discussion 
                key={item.did}
                discussion={item} 
                gid={gid}
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

Discussions.propTypes = {
  container: boolType,
  gid: stringType,
  limit: numberType,
  pagination: boolType,
  skeleton: boolType,
  uid: oneOfType([
    stringType,
    arrayType
  ])
}

Discussions.defaultProps = {
  container: true,
  gid: null,
  limit: 5,
  pagination: true,
  skeleton: false,
  uid: null
}
 
export default Discussions;