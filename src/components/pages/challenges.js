import React from 'react';
import { Helmet } from 'react-helmet';
// import { challengeRef, userChallengesRef } from '../../config/firebase';
import { app } from '../../config/shared';
import { userType } from '../../config/types';

class Challenges extends React.Component {
  state = {
    /* challenges: null,
    desc: true,
    loading: false,
    activeUserChallenge: null,
    userChallenges: null */
  }

  static propTypes = {
    user: userType
  }

  static defaultProps = {
    user: null
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user) {
      this.fetch();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
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