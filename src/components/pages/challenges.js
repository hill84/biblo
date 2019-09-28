import React from 'react';
import { Helmet } from 'react-helmet';
// import { challengeRef, userChallengesRef } from '../../config/firebase';
import { app } from '../../config/shared';

class Challenges extends React.Component {
  state = {
    challenges: null,
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
    console.log('fetch');
  }

  render() { 
    const { user } = this.props;

    if (!user) return null;

    return (
      <div className="container">
        <Helmet>
          <title>{app.name} | Sfide</title>
        </Helmet>

        <h2>Sfide</h2>
        <div className="card dark card-fullwidth-sm">
          Sfide
        </div>
      </div>
    );
  }
}
 
export default Challenges;