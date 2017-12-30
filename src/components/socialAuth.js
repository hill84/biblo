import React from 'react';
import { Redirect } from 'react-router-dom';
import { CircularProgress } from 'material-ui';
import { auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, storageKey } from '../config/firebase.js';

export default class SocialAuth extends React.Component {
	constructor() {
		super();
		this.state = {
			user: null,
            loading: false,
            redirectToReferrer: false
		}
	}

	socialAuth = provider => {
		this.setState({ loading: true });
        auth.signInWithPopup(provider) 
            .then(result => {
            const user = result.user;
			this.setState({ 
                user, 
                loading: false 
            });
		}).then(() => {
            this.setState({
                loading: false,
                redirectToReferrer: true
            });
        });
		setTimeout(() => this.setState({ loading: false }), 10000);
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
        const { redirectToReferrer } = this.state;
		const { from } = /*this.props.location.state ||*/ { from: { pathname: '/' } };

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
                {this.state.loading ? <div className="loader"><CircularProgress /></div> : ''}
            </div>
		);
	}
}