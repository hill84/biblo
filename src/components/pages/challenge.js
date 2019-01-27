import React from 'react';
import { Link } from 'react-router-dom';
import { challengeRef, userChallengesRef } from '../../config/firebase';
import { booksPerRow } from '../../config/shared';
import Cover from '../cover';
import { skltn_rows, skltn_shelfRow } from '../skeletons';

class Challenge extends React.Component {
  state = {
    challenges: null,
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
      this.setState({ loading: true }, () => {
        userChallengesRef(user.uid).get().then(uSnap => {
          if (!uSnap.empty) {
            const challenges = [];
            const userChallenges = [];
            uSnap.forEach(item => {
              item.data().cid && userChallenges.push(item.data());
            });
            userChallenges.forEach(item => {
              challengeRef(item.cid).get().then(snap => {
                if (snap.exists) {
                  challenges.push(snap.data());
                }
              }).catch(error => console.warn(error));
            });
            if (this._isMounted) {
              this.setState({ challenges, userChallenges, loading: false });
            }
          } else {
            if (this._isMounted) {
              this.setState({ challenges: null, userChallenges: null, loading: false });
            }
          }
        }).catch(error => console.warn(error));
      });
    }
  }

  render() { 
    if (!this.props.user) return null;

    const { challenges, loading, userChallenges } = this.state;

    const covers = !challenges 
      ? <div className="info-row empty">Non ci sono libri in questa sfida.</div>
      : <React.Fragment>
          {challenges.map(item => 
            <div key={item.cid} className={`shelf-row books-per-row-${booksPerRow} abreast`}>
              {Object.keys(item.books).map((bid, i) => 
                <Link key={bid} to={`/book/${bid}`}>
                  <Cover book={item.books[bid]} rating={false} full={true} index={i} />
                </Link>
              )}
            </div>
          )}
        </React.Fragment>

    return (
      <div className="container">
        <h2>Sfida</h2>
        {loading ? skltn_rows : !userChallenges 
          ? <div className="info-row empty">Non ci sono sfide.</div> 
          : <ul>{userChallenges.map(item => <li key={item.cid}>{item.title}</li> )}</ul>
        }
        <div className="card dark card-fullwidth-sm">
          <div className="shelf collection hoverable-items scrollable">
            {loading ? skltn_shelfRow : covers}
          </div>
        </div>
      </div>
    );
  }
}
 
export default Challenge;