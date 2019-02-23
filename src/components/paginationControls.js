import React from 'react';
import { icon } from '../config/icons';
import { boolType, funcType, numberType } from '../config/types';

export default class PaginationControls extends React.Component {
  static propTypes = {
    count: numberType.isRequired,
    fetch: funcType.isRequired,
    limit: numberType.isRequired,
    loading: boolType,
    oneWay: boolType,
    page: numberType
  }

  static defaultProps = {
    loading: false,
    oneWay: false,
    page: 1
  }

  render() {
    const { count, fetch, limit, loading, oneWay, page } = this.props;

    return (
      <React.Fragment>
        {count > limit &&
          <div className={`info-row footer centered pagination ${loading ? 'loading' : 'loaded'}`}>
            {!oneWay &&
              <React.Fragment>
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
              </React.Fragment>
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
      </React.Fragment>
    );
  }
}