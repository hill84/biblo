import React from 'react';
//import { Redirect } from 'react-router-dom';
import { auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, storageKey } from '../config/firebase.js';

export default class SocialAuth extends React.Component {
	constructor() {
		super();
		this.state = {
			user: null,
			loading: false
		}
	}

	socialAuth = provider => {
		this.setState({ loading: true });
        auth.signInWithPopup(provider) 
            .then(result => {
            const user = result.user;
			this.setState({ user, loading: false });
		});
		setTimeout(() => this.setState({ loading: false }), 3000);
	}
	googleAuth = () => this.socialAuth(GoogleAuthProvider);
	facebookAuth = () => this.socialAuth(FacebookAuthProvider);
	twitterAuth = () => this.socialAuth(TwitterAuthProvider);

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

	render() {
		return (
			<div className="row socialButtons" id="socialAuthComponent">
                <div className="col-4">
                    <button className="btnGoogle" onClick={this.googleAuth}>Google</button>
                </div>
                <div className="col-4">
                    <button className="btnFacebook" onClick={this.facebookAuth}>Facebook</button>
                </div>
                <div className="col-4">
                    <button className="btnTwitter" onClick={this.twitterAuth}>Twitter</button>
                </div>
            </div>
		);
	}
}