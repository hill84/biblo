import React from 'react';
import { Redirect } from 'react-router-dom';
import { CircularProgress } from 'material-ui';
import { auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, storageKey, userRef } from '../config/firebase';

export default class SocialAuth extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: null,
            loading: false,
            redirectToReferrer: false
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				window.localStorage.setItem(storageKey, user.uid);
				this.setState({ user });
			} else {
				window.localStorage.removeItem(storageKey);
				this.setState({ user: null });
			}
		});
	}

	socialAuth = provider => {
		auth.signInWithPopup(provider).then(result => {
			this.setState({ loading: true });
			if (result) {
				const user = result.user;
				this.setState({ user });
				userRef(user.uid).set({
					displayName: user.displayName,
					email: user.email,
					photoURL: user.photoURL,
					creationTime: user.metadata.creationTime
				});
			}
		}).then(() => {
			this.setState({ redirectToReferrer: true });
		}).catch(error => {
			console.log(error);
			this.setState({ loading: false });
		});
	}
	googleAuth = () => this.socialAuth(GoogleAuthProvider);
	facebookAuth = () => this.socialAuth(FacebookAuthProvider);
	twitterAuth = () => this.socialAuth(TwitterAuthProvider);

	render(props) {
        const { redirectToReferrer } = this.state;
		const { from } = /* this.props.location.state || */ { from: { pathname: '/' } };

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div className="row socialButtons" id="socialAuthComponent">
                <div className="col-4">
                    <button className="btn btnGoogle" onClick={this.googleAuth}>Google</button>
                </div>
                <div className="col-4">
                    <button className="btn btnFacebook" onClick={this.facebookAuth}>Facebook</button>
                </div>
                <div className="col-4">
                    <button className="btn btnTwitter" onClick={this.twitterAuth}>Twitter</button>
                </div>
                {this.state.loading && <div className="loader"><CircularProgress /></div>}
            </div>
		);
	}
}