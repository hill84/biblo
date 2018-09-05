import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { authorsRef } from '../config/firebase';
import { numberType } from '../config/types';
import { getInitials } from '../config/shared';

export default class Authors extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: false,
    limit: this.props.limit || 10,
    loading: true,
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
    authorsRef.where('photoURL', '>', '').orderBy('photoURL', desc ? 'desc' : 'asc').limit(limit).get().then(snap => {
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
    const { items, loading, size } = this.state;

    if (!items || items.length < 1) {
      if (loading) { 
        return <div className="loader"><CircularProgress /></div>; 
      } else { 
        return <div className="info-row empty text-center">Non ci sono ancora autori.</div>;
      }
    }

		return (
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
		);
	}
}