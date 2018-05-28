import React from 'react';
import { Redirect } from 'react-router-dom';
import CircularProgress from 'material-ui/CircularProgress';
import { auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, userRef } from '../config/firebase';

export default class SocialAuth extends React.Component {
	state = {
    roles: {
      admin: false,
      editor: true,
      premium: false
    },
    stats: {
      followed_num: 0,
      followers_num: 0,
      ratings_num: 0,
      reviews_num: 0,
      shelf_num: 0,
      wishlist_num: 0
    },
    loading: false,
    redirectToReferrer: false
  }

	socialAuth = provider => {
		auth.signInWithPopup(provider).then(result => {
			this.setState({ loading: true });
			if (result) {
				const user = result.user;
				this.setState({ user });
				if (result.additionalUserInfo.isNewUser) {
					userRef(user.uid).set({
						uid: user.uid,
						displayName: user.displayName,
						email: user.email,
						photoURL: user.photoURL,
						creationTime: user.metadata.creationTime,
						roles: this.state.roles,
						stats: this.state.stats
					});
				}
			}
		}).then(() => {
			this.setState({ redirectToReferrer: true });
		}).catch(error => {
			console.warn(error);
			this.setState({ loading: false });
		});
	}
	googleAuth = () => this.socialAuth(GoogleAuthProvider);
	facebookAuth = () => this.socialAuth(FacebookAuthProvider);
	twitterAuth = () => this.socialAuth(TwitterAuthProvider);

	render(props) {
    const { loading, redirectToReferrer } = this.state;
		const { from } = /* this.props.location.state || */ { from: { pathname: '/' } };

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div className="row" id="socialAuthComponent">
        <div className="col-4">
          <button className="btn google" onClick={this.googleAuth}>Google</button>
        </div>
        <div className="col-4">
          <button className="btn facebook" onClick={this.facebookAuth}>Facebook</button>
        </div>
        <div className="col-4">
          <button className="btn twitter" onClick={this.twitterAuth}>Twitter</button>
        </div>
        {loading && <div className="loader"><CircularProgress /></div>}
      </div>
		);
	}
}