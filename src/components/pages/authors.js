import Avatar from '@material-ui/core/Avatar';
import React from 'react';
import Link from 'react-router-dom/Link';
import { authorsRef } from '../../config/firebase';
import { numberType } from '../../config/types';
import { getInitials } from '../../config/shared';
import { skltn_bubbleRow } from '../skeletons';

export default class Authors extends React.Component {
	state = {
    items: null,
    count: 0,
    desc: true,
    limit: this.props.limit || 50,
    loading: true,
    page: 1,
    pagination: false,
    scrollable: true,
    size: 50
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

    if (!loading && !items) {
      return <div className="info-row empty text-center">Non ci sono ancora autori.</div>;
    }

		return (
      <div className="container" id="authorsComponent">
        <div className="bubbles row shelf">
          {loading ? skltn_bubbleRow :
            <div className="shelf-row hoverable-items" style={{gridTemplateColumns: 'repeat(10, 1fr)'}}>
              {items.map((item, index) => 
                <Link to={`/author/${item.displayName}`} key={item.displayName} style={{'--size': `${size}px`, animationDelay: `${index/10}s`}} className="bubble col">
                  <Avatar className="avatar centered" src={item.photoURL} alt={item.displayName}>{!item.photoURL && getInitials(item.displayName)}</Avatar>
                  <div className="title">{item.displayName}</div>
                </Link>
              )}
            </div>
          }
        </div>
      </div>
		);
	}
}