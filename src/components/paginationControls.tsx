import classnames from 'classnames';
import React, { FC, MouseEvent } from 'react';
import icon from '../config/icons';
import '../css/pagination.css';

interface PaginationControlsProps {
  count: number;
  fetch: (e: MouseEvent) => void;
  forceVisibility?: boolean;
  limit: number;
  loading?: boolean;
  oneWay?: boolean;
  page?: number;
}

const PaginationControls: FC<PaginationControlsProps> = ({
  count,
  fetch,
  forceVisibility = false,
  limit,
  loading = false,
  oneWay = false,
  page = 1,
}: PaginationControlsProps) => {
  if (count <= limit && !forceVisibility) return null;

  return (
    <div className={classnames('info-row', 'footer', 'centered', 'pagination', loading ? 'loading' : 'loaded')}>
      {!oneWay && (
        <>
          <button 
            type='button'
            disabled={page === 1} 
            className='btn icon rounded flat' 
            data-direction='prev'
            onClick={fetch} 
            title='precedente'>
            {icon.chevronLeft}
          </button>
          <span className='page'>{page} di {(count % limit > 0 ? 1 : 0) + ((count - count % limit) / limit)}</span>
        </>
      )}
      <button 
        type='button'
        disabled={(loading || page >= (count / limit))} 
        className={classnames('btn', 'rounded', 'flat', oneWay && !loading ? 'oneway' : 'icon')}
        data-direction='next'
        onClick={fetch} 
        title='successivo'>
        {oneWay ? loading ? icon.loading : 'Mostra altro' : icon.chevronRight}
      </button>
    </div>
  );
};
 
export default PaginationControls;