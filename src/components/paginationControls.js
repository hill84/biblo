import React from 'react';
import { icon } from '../config/icons';
import { funcType, numberType } from '../config/types';

export default class PaginationControls extends React.Component {
  state = {
    count: this.props.count || 0,
    fetchNext: this.props.fetchNext,
    fetchPrev: this.props.fetchPrev,
    lastVisible: this.props.lastVisible || null,
    limit: this.props.limit || 0,
    page: this.props.page || 1
  }

  static propTypes = {
    count: numberType.isRequired,
    fetchNext: funcType.isRequired,
    fetchPrev: funcType.isRequired,
    limit: numberType.isRequired,
    page: numberType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.count !== state.count) { return { count: props.count }; }
    if (props.limit !== state.limit) { return { limit: props.limit }; }
    if (props.page !== state.page) { return { page: props.page }; }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { fetchNext, fetchPrev, limit, page, count } = this.state;

    return (
      <React.Fragment>
        {count > limit &&
          <div className="info-row footer centered pagination">
            <button 
              disabled={page === 1 && 'disabled'} 
              className="btn icon rounded flat" 
              onClick={fetchPrev} title="precedente">
              {icon.chevronLeft()}
            </button>
            <span className="page">{page} di {(count % limit > 0 ? 1 : 0) + ((count - count % limit) / limit)}</span>
            <button 
              disabled={page > (count / limit) && 'disabled'} 
              className="btn icon rounded flat" 
              onClick={fetchNext} title="successivo">
              {icon.chevronRight()}
            </button>
          </div>
        }
      </React.Fragment>
    );
  }
}