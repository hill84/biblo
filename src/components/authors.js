import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import { Link } from 'react-router-dom';
import { authorsRef, countRef } from '../config/firebase';
import { numberType, boolType } from '../config/types';
import { getInitials, normURL } from '../config/shared';
import icon from '../config/icons';
import { skltn_bubbleRow } from './skeletons';

export default class Authors extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: true,
    limit: this.props.limit,
    loading: true,
    page: 1,
    pagination: false,
    scrollable: true
  }

  static propTypes = {
    inView: boolType,
    limit: numberType,
    size: numberType
  }

  static defaultProps = {
    inView: true,
    limit: 10,
    size: 80
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const { limit, inView } = this.props;
    if (inView !== prevProps.inView || limit !== prevState.limit) {
      this.fetch();
    } 
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetch = () => { 
    const { inView } = this.props;
    const { desc, limit } = this.state;

    if (inView) {
      authorsRef.orderBy('lastEdit_num', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          if (this._isMounted) {
            this.setState({ 
              // count: snap.docs.length,
              items,
              loading: false
            });
          }
          countRef('authors').get().then(fullSnap => {
            if (fullSnap.exists) { 
              if (this._isMounted) {
                this.setState({ count: fullSnap.data().count });
              }
            }
          }).catch(err => console.warn(err));
        } else if (this._isMounted) {
          this.setState({ 
            count: 0,
            items: null,
            loading: false
          });
        }
      }).catch(err => console.warn(err));
    }
  }
	
	render() {
    const { size } = this.props;
    const { count, desc, items, limit, loading, page, pagination, scrollable } = this.state;

    if (!loading && !items) {
      return <div className="info-row empty text-center">Non ci sono ancora autori.</div>;
    }

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
                  onClick={this.onToggleDesc}>
                  {icon.arrowDown()}
                </button>
              }
              {pagination && count > limit &&
                <>
                  <button 
                    type="button"
                    disabled={page < 2 && 'disabled'} 
                    className="btn sm clear prepend" 
                    onClick={() => this.fetch('prev')} title="precedente">
                    {icon.chevronLeft()}
                  </button>
                  <button 
                    type="button"
                    disabled={page > (count / limit) && 'disabled'} 
                    className="btn sm clear append" 
                    onClick={() => this.fetch('next')} title="successivo">
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
                <Link to={`/author/${normURL(item.displayName)}`} key={item.displayName} style={{ '--avatarSize': `${size}px`, animationDelay: `${index/10}s`, }} className="bubble col">
                  <Avatar className="avatar centered" src={item.photoURL} alt={item.displayName}>{!item.photoURL && getInitials(item.displayName)}</Avatar>
                  <div className="title">{item.displayName}</div>
                </Link>
              )}
            </div>
          }
        </div>
      </>
		);
	}
}