import React from 'react';
import icon from '../config/icons';
import { boolType, funcType, numberType } from '../config/types';

const PaginationControls = props => {
  const { count, fetch, limit, loading, oneWay, page } = props;

  return (
    <>
      {count > limit &&
        <div className={`info-row footer centered pagination ${loading ? 'loading' : 'loaded'}`}>
          {!oneWay &&
            <>
              <button 
                type="button"
                disabled={page === 1 && 'disabled'} 
                className="btn icon rounded flat" 
                data-direction="prev"
                onClick={fetch} 
                title="precedente">
                {icon.chevronLeft()}
              </button>
              <span className="page">{page} di {(count % limit > 0 ? 1 : 0) + ((count - count % limit) / limit)}</span>
            </>
          }
          <button 
            type="button"
            disabled={(loading || page >= (count / limit)) && 'disabled'} 
            className={`btn rounded flat ${oneWay && !loading ? 'oneway' : 'icon'}`}
            data-direction="next"
            onClick={fetch} 
            title="successivo">
            {oneWay ? loading ? icon.loading() : 'Mostra altro' : icon.chevronRight()}
          </button>
        </div>
      }
    </>
  );
}

PaginationControls.propTypes = {
  count: numberType.isRequired,
  fetch: funcType.isRequired,
  limit: numberType.isRequired,
  loading: boolType,
  oneWay: boolType,
  page: numberType
}

PaginationControls.defaultProps = {
  loading: false,
  oneWay: false,
  page: 1
}
 
export default PaginationControls;