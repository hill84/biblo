import React from 'react';
import { Link } from 'react-router-dom';
import { challengeRef, userChallengesRef } from '../../config/firebase';
import { booksPerRow } from '../../config/shared';
import Cover from '../cover';
import { skltn_shelfRow } from '../skeletons';

class Challenge extends React.Component {
  state = {
    booksPerRow: booksPerRow(),
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
    const { booksPerRow, challenge, loading, userChallenges } = this.state;

    if (!user) return null;

    const empty = (
      <div className="card dark card-fullwidth-sm">
        <div className="info-row empty">Sfida non trovata.</div>
      </div>
    );

    const skltn = (
      <div className="card dark card-fullwidth-sm">
        <div className="shelf collection hoverable-items scrollable">
          {skltn_shelfRow}
        </div>
      </div>
    );

    const count = books => Object.keys(books || []).length;
    const progress = books => (100 / count(books) * Object.keys(books).filter(item => books[item]).length).toFixed(0);

    return (
      <div className="container">
        <h2>Sfida</h2>
        {loading ? skltn : (!challenge || !userChallenges) ? empty : userChallenges.map(item =>
          <div className="card dark card-fullwidth-sm" key={item.cid}>
            <div className="head nav">
              <div className="row">
                <div className="col">
                  {/* <button 
                    type="button"
                    className="btn sm flat counter icon" 
                    title={coverview ? 'Stack view' : 'Cover view'} 
                    onClick={this.onToggleView}>
                    {coverview ? icon.viewSequential() : icon.viewGrid()}
                  </button> */}
                  <span className="primary-text hide-sm">Sfida:</span> <span className="counter last title">{item.title}</span> <span className="count hide-xs">({count(item.books)} libri)</span>
                </div>
                <div className="col-4 col-sm-4 col-md-3 col-lg-2">
                  <div className="row">
                    <div className="col">
                      <div className="stepper-wrapper" style={{marginTop: 9}}>
                        <div className="stepper">
                          <div className="bar inprogress" style={{width: `${progress(item.books)}%`}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="counter last">{progress(item.books)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                
            <div className="shelf scrollable">
              <div className="collection hoverable-items">
                <div key={item.cid} className={`shelf-row books-per-row-${booksPerRow} abreast`}>
                  {loading ? skltn : Object.keys(item.books).map((bid, i) => 
                    <Link key={bid} to={`/book/${bid}`} className={item.books[bid] ? 'read' : 'not-read'}>
                      <Cover book={challenge.books[bid]} rating={false} index={i} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
 
export default Challenge;