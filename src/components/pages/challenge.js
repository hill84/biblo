import React from 'react';
import { Link } from 'react-router-dom';
import { challengeRef, userChallengesRef } from '../../config/firebase';
import { booksPerRow } from '../../config/shared';
import Cover from '../cover';
import { skltn_rows, skltn_shelfRow } from '../skeletons';

class Challenge extends React.Component {
  state = {
    challenge: null,
    loading: false,
    userChallenges: null
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.fetch();
    }
  }

  fetch = () => {
    const { user } = this.props;

    if (this._isMounted) { 
      if (user) {
        this.setState({ loading: true }, () => {
          userChallengesRef(user.uid).get().then(uSnap => {
            if (!uSnap.empty) {
              const userChallenges = [];
              uSnap.forEach(item => {
                if (item.data().cid) {
                  userChallenges.push(item.data());
                  challengeRef(item.data().cid).get().then(snap => {
                    if (snap.exists) {
                      if (this._isMounted) {
                        this.setState({ challenge: snap.data() });
                      }
                    }
                  }).catch(error => console.warn(error));
                }
              });
              if (this._isMounted) {
                this.setState({ userChallenges, loading: false });
              }
            } else {
              if (this._isMounted) {
                this.setState({ challenge: null, userChallenges: null, loading: false });
              }
            }
          }).catch(error => console.warn(error));
        });
      }
    }
  }

  render() { 
    const { user } = this.props;
    const { challenge, loading, userChallenges } = this.state;

    if (!user) return null;

    const empty = <div className="info-row empty">Sfida non trovata.</div>;

    const covers = !challenge ? empty : userChallenges.map(item =>
      <div key={item.cid} className={`shelf-row books-per-row-${booksPerRow} abreast`}>
        {Object.keys(item.books).map((bid, i) => 
          <Link key={bid} to={`/book/${bid}`} className={item.books[bid] ? 'read' : 'not-read'}>
            <Cover book={challenge.books[bid]} rating={false} index={i} />
          </Link>
        )}
      </div>
    );

    return (
      <div className="container">
        <h2>Sfida</h2>
        {loading ? skltn_rows : !userChallenges ? empty : <ul>{userChallenges.map(item => <li key={item.cid}>{item.title}</li> )}</ul>}
        <div className="card dark card-fullwidth-sm">
          <div className="shelf collection hoverable-items scrollable">
            {loading ? skltn_shelfRow : covers }
          </div>
        </div>
      </div>
    );
  }
}
 
export default Challenge;