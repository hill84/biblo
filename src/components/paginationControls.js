import React from 'react';
import { icon } from '../config/icons';
import { funcType, numberType, boolType } from '../config/types';

export default class PaginationControls extends React.Component {
  state = {
    count: this.props.count,
    fetchNext: this.props.fetchNext,
    fetchPrev: this.props.fetchPrev,
    limit: this.props.limit,
    loading: this.props.loading || false,
    oneWay: this.props.oneWay || false,
    page: this.props.page || 1
  }

  static propTypes = {
    count: numberType.isRequired,
    fetchNext: funcType.isRequired,
    fetchPrev: funcType,
    limit: numberType.isRequired,
    loading: boolType,
    oneWay: boolType,
    page: numberType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.count !== state.count) { return { count: props.count }; }
    if (props.loading !== state.loading) { return { loading: props.loading }; }
    if (props.page !== state.page) { return { page: props.page }; }
    return null;
  }

  render() {
    const { count, fetchNext, fetchPrev, limit, loading, oneWay, page } = this.state;

    return (
      <React.Fragment>
        {count > limit &&
          <div className={`info-row footer centered pagination ${loading ? 'loading' : 'loaded'}`}>
            {!oneWay &&
              <React.Fragment>
                <button 
                  disabled={page === 1 && 'disabled'} 
                  className="btn icon rounded flat" 
                  onClick={fetchPrev} title="precedente">
                  {icon.chevronLeft()}
                </button>
                <span className="page">{page} di {(count % limit > 0 ? 1 : 0) + ((count - count % limit) / limit)}</span>
              </React.Fragment>
            }
            <button 
              disabled={(loading || page >= (count / limit)) && 'disabled'} 
              className={`btn rounded flat ${oneWay && !loading ? 'oneway' : 'icon'}`}
              onClick={fetchNext} title="successivo">
              {oneWay ? loading ? icon.loading() : 'Mostra altro' : icon.chevronRight()}
            </button>
          </div>
        }
      </React.Fragment>
    );
  }
}