import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { challengeRef, userChallengesRef } from '../../config/firebase';
import { app, booksPerRow } from '../../config/shared';
import Cover from '../cover';
import { skltn_shelfRow } from '../skeletons';

class Challenge extends React.Component {
  state = {
    booksPerRow: booksPerRow(),
    challenge: null,
    desc: true,
    loading: false,
    activeUserChallenge: null,
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
    const { desc } = this.state;

    if (this._isMounted) { 
      if (user) {
        this.setState({ loading: true }, () => {
          userChallengesRef(user.uid).orderBy('created_num', desc ? 'desc' : 'asc').get().then(uSnap => {
            if (!uSnap.empty) {
              const userChallenges = [];

              uSnap.forEach(item => {
                // console.log(item.data());
                if (item.data().completed_num === 0) {
                  if (item.data().cid) {
                    challengeRef(item.data().cid).get().then(snap => {
                      if (snap.exists) {
                        if (this._isMounted) {
                          this.setState({ challenge: snap.data(), userChallenge: item.data(), loading: false });
                        }
                      }
                    }).catch(err => {
                      console.warn(err);
                      if (this._isMounted) {
                        this.setState({ challenge: null, userChallenge: null, loading: false });
                      }
                    });
                  }
                } else {
                  userChallenges.push(item.data());
                }
              });
              if (this._isMounted) {
                this.setState({ userChallenges });
              }
            } else {
              if (this._isMounted) {
                this.setState({ challenge: null, userChallenges: null, loading: false });
              }
            }
          }).catch(err => {
            console.warn(err);
            if (this._isMounted) {
              this.setState({ challenge: null, userChallenges: null, loading: false });
            }
          });
        });
      }
    }
  }

  render() { 
    const { user } = this.props;
    const { booksPerRow, challenge, loading, userChallenge, userChallenges } = this.state;

    if (!user) return null;

    const count = books => Object.keys(books || []).length;
    const progress = books => (100 / count(books) * Object.keys(books).filter(item => books[item]).length).toFixed(0);

    return (
      <div className="container">
        <Helmet>
          <title>{app.name} | Sfida</title>
        </Helmet>

        <div className="row">
          <div className="col"><h2>Sfida</h2></div>
          {userChallenge && 
            <div className="col text-right">
              <h4 className="counter light-text">Accettata il {new Date(userChallenge.created_num).toLocaleDateString()}</h4>
            </div>
          }
        </div>
        <div className="card dark card-fullwidth-sm">
          <div className="head nav">
            <div className="row">
              <div className="col">
                <span className="primary-text hide-sm">Sfida:</span> <span className="counter last title">{userChallenge ? userChallenge.title : 'non trovata'}</span> <span className="count hide-xs">({userChallenge ? count(userChallenge.books) : 0} libri)</span>
              </div>
              {userChallenge &&
                <div className="col-4 col-sm-4 col-md-3 col-lg-2">
                  <div className="row">
                    <div className="col">
                      <div className="stepper-wrapper" style={{ marginTop: 9 }}>
                        <div className="stepper">
                          <div className="bar inprogress" style={{width: `${progress(userChallenge.books)}%`}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="counter last">{progress(userChallenge.books)}%</div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
              
          <div className="shelf scrollable">
            <div className="collection hoverable-items">
              {loading ? skltn_shelfRow : !userChallenge ? 'Sfida non trovata' :
                <div key={userChallenge.cid} className={`shelf-row books-per-row-${booksPerRow} abreast`}>
                  {Object.keys(userChallenge.books).map((bid, i) => 
                    <Link key={bid} to={`/book/${bid}`} className={userChallenge.books[bid] ? 'read' : 'not-read'}>
                      <Cover book={challenge.books[bid]} rating={false} index={i} />
                    </Link>
                  )}
                </div>
              }
            </div>
          </div>
        </div>

        {!loading && userChallenges && 
          <React.Fragment>
            <h2>Sfide completate</h2>
            {userChallenges.map((item, i) =>
              <div className="card dark card-fullwidth-sm" key={item.cid || i}>
                <div className="row">
                  <div className="col">
                    <span className="primary-text hide-sm">Sfida:</span> <span className="counter last title">{item.title}</span> <span className="count hide-xs">({count(item.books)} libri)</span>
                  </div>
                  {item.completed_num !== 0 && 
                    <div className="col text-right">
                      <span className="counter light-text">Completata il {new Date(item.completed_num).toLocaleDateString()}</span>
                    </div>
                  }
                </div>
              </div>
            )}
          </React.Fragment>
        }
      </div>
    );
  }
}
 
export default Challenge;