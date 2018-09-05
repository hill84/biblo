import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { authorsRef } from '../config/firebase';
import { numberType } from '../config/types';
import { getInitials } from '../config/shared';
import { icon } from '../config/icons';

export default class Authors extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: true,
    limit: this.props.limit || 10,
    loading: true,
    page: 1,
    pagination: false,
    scrollable: true,
    size: this.props.size || 80
  }

  static propTypes = {
    limit: numberType
  }

  componentDidMount(prevState) {
    this.fetch();
  }

  fetch = () => { 
    const { desc, limit } = this.state;
    authorsRef.orderBy('photoURL', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
      if (!snap.empty) {
        const items = [];
        snap.forEach(item => items.push(item.data()));
        this.setState({ 
          count: snap.docs.length,
          items,
          loading: false
        });
      } else {
        this.setState({ 
          count: 0,
          items: null,
          loading: false
        });
      }
    }).catch(error => console.warn(error));
  }
	
	render() {
    const { count, desc, items, limit, loading, page, pagination, scrollable, size } = this.state;

    if (!items || items.length < 1) {
      if (loading) { 
        return <div className="loader"><CircularProgress /></div>; 
      } else { 
        return <div className="info-row empty text-center">Non ci sono ancora autori.</div>;
      }
    }

		return (
      <React.Fragment>
        <div className="head nav" role="navigation">
          <span className="counter last title primary-text">Autori</span> {count !== 0 && <span className="count hide-xs">({count} scrittori)</span>} 
          {!loading && count > 0 &&
            <div className="pull-right">
              {(pagination && count > limit) || scrollable ?
                <Link to="/authors" className="btn sm flat counter">Vedi tutti</Link>
              :
                <button 
                  className={`btn sm icon flat counter ${desc ? 'desc' : 'asc'}`} 
                  title={desc ? 'Ascendente' : 'Discendente'} 
                  onClick={this.onToggleDesc}>
                  {icon.arrowDown()}
                </button>
              }
              {pagination && count > limit &&
                <React.Fragment>
                  <button 
                    disabled={page < 2 && 'disabled'} 
                    className="btn sm clear prepend" 
                    onClick={() => this.fetch('prev')} title="precedente">
                    {icon.chevronLeft()}
                  </button>
                  <button 
                    disabled={page > (count / limit) && 'disabled'} 
                    className="btn sm clear append" 
                    onClick={() => this.fetch('next')} title="successivo">
                    {icon.chevronRight()}
                  </button>
                </React.Fragment>
              }
            </div>
          }
        </div>
        <div className="bubbles row shelf scrollable">
          <div className="shelf-row hoverable-items">
            {items.map(item => 
              <Link to={`/author/${item.displayName}`} key={item.displayName} style={{minWidth: size}} className="bubble col">
                <Avatar style={{width: size, height: size}} className="avatar centered" src={item.photoURL} alt={item.displayName}>{!item.photoURL && getInitials(item.displayName)}</Avatar>
                <div className="name">{item.displayName}</div>
              </Link>
            )}
          </div>
        </div>
      </React.Fragment>
		);
	}
}