import Avatar from '@material-ui/core/Avatar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorsRef, countRef } from '../config/firebase';
import { numberType, boolType } from '../config/types';
import { getInitials, normURL } from '../config/shared';
import icon from '../config/icons';
import { skltn_bubbleRow } from './skeletons';

const Authors = props => {
  const [state, setState] = useState({
    items: null,
    count: 0,
    desc: true,
    limit: props.limit,
    loading: true,
    page: 1,
    scrollable: true
  });

  const is = useRef(true);

  const { inView, pagination, size } = props;
  const { count, desc, items, limit, loading, page, scrollable } = state;

  const onToggleDesc = () => setState(prevState => ({ ...prevState, desc: !prevState.desc }));
  
  const fetch = useCallback((/* e */) => {
    // const direction = e && e.currentTarget.dataset.direction;
    // const prev = direction === 'prev';
    // TODO: paginated fetch

    if (inView) {
      authorsRef.orderBy('lastEdit_num', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          if (is.current) {
            setState(prevState => ({ 
              ...prevState, 
              // count: snap.docs.length,
              items,
              loading: false
            }));
          }
          countRef('authors').get().then(fullSnap => {
            if (fullSnap.exists) { 
              if (is.current) {
                setState(prevState => ({ 
                  ...prevState, 
                  count: fullSnap.data().count 
                }));
              }
            }
          }).catch(err => console.warn(err));
        } else if (is.current) {
          setState(prevState => ({ 
            ...prevState, 
            count: 0,
            items: null,
            loading: false
          }));
        }
      }).catch(err => console.warn(err));
    }
  }, [desc, inView, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  return (
    <>
      <div className="head nav" role="navigation">
        <span className="counter last title primary-text">Autori</span> {items && <span className="count hide-xs">({items ? items.length : limit}{count ? ` di ${count}` : ''})</span>} 
        {!loading && count > 0 &&
          <div className="pull-right">
            {(pagination && count > limit) || scrollable ?
              <Link to="/authors" className="btn sm flat counter">Vedi tutti</Link>
            :
              <button 
                type="button"
                className={`btn sm icon flat counter ${desc ? 'desc' : 'asc'}`} 
                title={desc ? 'Ascendente' : 'Discendente'} 
                onClick={onToggleDesc}>
                {icon.arrowDown()}
              </button>
            }
            {pagination && count > limit &&
              <>
                <button 
                  type="button"
                  disabled={page < 2 && 'disabled'} 
                  className="btn sm clear prepend" 
                  data-direction="prev"
                  onClick={fetch} title="precedente">
                  {icon.chevronLeft()}
                </button>
                <button 
                  type="button"
                  disabled={page > (count / limit) && 'disabled'} 
                  className="btn sm clear append" 
                  data-direction="next"
                  onClick={fetch} title="successivo">
                  {icon.chevronRight()}
                </button>
              </>
            }
          </div>
        }
      </div>
      <div className="bubbles row shelf scrollable">
        {loading ? skltn_bubbleRow :
          <div className="shelf-row hoverable-items avatars-row">
            {items.map((item, index) => 
              <Link 
                to={`/author/${normURL(item.displayName)}`} 
                key={item.displayName} 
                style={{ '--avatarSize': `${size}px`, animationDelay: `${index/10}s`, }} 
                className="bubble col">
                <Avatar 
                  className="avatar centered" 
                  src={item.photoURL} 
                  alt={item.displayName}>
                  {!item.photoURL && getInitials(item.displayName)}
                </Avatar>
                <div className="title">{item.displayName}</div>
              </Link>
            )}
          </div>
        }
      </div>
    </>
  );
}

Authors.propTypes = {
  inView: boolType,
  limit: numberType,
  pagination: boolType,
  size: numberType
}

Authors.defaultProps = {
  inView: true,
  limit: 10,
  pagination: false,
  size: 80
}

export default Authors;