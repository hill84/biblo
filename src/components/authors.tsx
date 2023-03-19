import type { DocumentData } from '@firebase/firestore-types';
import { Tooltip } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import classnames from 'classnames';
import type { CSSProperties, FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { authorsRef, countRef } from '../config/firebase';
import icon from '../config/icons';
import { getInitials, normURL } from '../config/shared';
import type { AuthorModel } from '../types';
import { skltn_bubbleRow } from './skeletons';

interface AuthorsProps {
  inView?: boolean;
  limit?: number;
  pagination?: boolean;
  scrollable?: boolean;
  size?: number;
}

interface StateModel {
  count: number;
  desc: boolean;
  items: AuthorModel[];
  limit: number;
  loading: boolean;
  page: number;
  scrollable: boolean;
}

const initialState: StateModel = {
  count: 0,
  desc: true,
  items: [],
  limit: 10,
  loading: true,
  page: 1,
  scrollable: true
};

const Authors: FC<AuthorsProps> = ({
  inView = true,
  limit: _limit = 10,
  pagination = false,
  scrollable: _scrollable = true,
  size = 80,
}: AuthorsProps) => {
  const [state, setState] = useState<StateModel>({
    ...initialState,
    limit: _limit,
    scrollable: _scrollable,
  });

  const { count, desc, items, limit, loading, page, scrollable }: StateModel = state;

  const { t } = useTranslation(['common']);

  const onToggleDesc = (): void => setState(prevState => ({ ...prevState, desc: !prevState.desc }));
  
  const fetch = useCallback((/* e */): void => {
    // const direction = e?.currentTarget.dataset.direction;
    // const prev = direction === 'prev';
    // TODO: paginated fetch

    if (inView) {
      authorsRef.orderBy('lastEdit_num', desc ? 'desc' : 'asc').limit(limit).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          const items: AuthorModel[] = [];
          snap.forEach((item: DocumentData): number => items.push(item.data()));
          setState(prevState => ({ 
            ...prevState, 
            // count: snap.docs.length,
            items,
            loading: false
          }));
          countRef('authors').get().then((fullSnap: DocumentData): void => {
            if (fullSnap.exists) {
              setState(prevState => ({ 
                ...prevState, 
                count: fullSnap.data().count 
              }));
            }
          }).catch((err: Error): void => console.warn(err));
        } else {
          setState(prevState => ({
            ...prevState, 
            count: 0,
            items: [],
            loading: false
          }));
        }
      }).catch((err: Error): void => console.warn(err));
    }
  }, [desc, inView, limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <>
      <div className='head nav' role='navigation'>
        <span className='counter last title primary-text'>{t('PAGE_AUTHORS')}</span> {items && <span className='count hide-xs'>({items ? items.length : limit}{count ? ` ${t('OF')} ${count}` : ''})</span>} 
        {!loading && count > 0 && (
          <div className='pull-right'>
            {(pagination && count > limit) || scrollable ? (
              <Link to='/authors' className='btn sm flat counter'>
                {t('ACTION_SHOW_ALL')}
              </Link>
            ) : (
              <Tooltip title={t(desc ? 'ASCENDING' : 'DESCENDING')}>
                <span>
                  <button
                    type='button'
                    className={classnames('btn', 'sm', 'icon', 'flat', 'counter', desc ? 'desc' : 'asc')}
                    onClick={onToggleDesc}
                    disabled={count < 2}>
                    {icon.arrowDown}
                  </button>
                </span>
              </Tooltip>
            )}
            {pagination && count > limit && (
              <>
                <button 
                  type='button'
                  disabled={page < 2} 
                  className='btn sm clear prepend' 
                  data-direction='prev'
                  onClick={fetch} title='precedente'>
                  {icon.chevronLeft}
                </button>
                <button 
                  type='button'
                  disabled={page > (count / limit)} 
                  className='btn sm clear append' 
                  data-direction='next'
                  onClick={fetch} title='successivo'>
                  {icon.chevronRight}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className='bubbles row shelf scrollable'>
        {loading ? skltn_bubbleRow : items ? (
          <div className='shelf-row hoverable-items avatars-row'>
            {items.map((item, index) => (
              <Link 
                to={`/author/${normURL(item.displayName)}`} 
                key={item.displayName} 
                style={{ '--avatarSize': `${size}px`, animationDelay: `${index/10}s`, } as CSSProperties} 
                className='bubble col'>
                <Avatar 
                  className='avatar centered' 
                  src={item.photoURL} 
                  alt={item.displayName}>
                  {!item.photoURL && getInitials(item.displayName)}
                </Avatar>
                <div className='title'>{item.displayName}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='empty centered'>{t('EMPTY_LIST')}</div>
        )}
      </div>
    </>
  );
};

export default Authors;