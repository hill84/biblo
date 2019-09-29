import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import { Redirect } from 'react-router-dom';
import { auth, FacebookAuthProvider, GoogleAuthProvider, TwitterAuthProvider, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { boolType, funcType } from '../config/types';

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

  static propTypes = {
    disabled: boolType,
    openSnackbar: funcType.isRequired
  }

  static defaultProps = {
    disabled: false
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

	socialAuth = provider => {
    const { openSnackbar } = this.props;
    const { roles, stats } = this.state;

		auth.signInWithPopup(provider).then(res => {
			if (this._isMounted) this.setState({ loading: true });
			if (res) {
        const user = res.user;
        if (this._isMounted) this.setState({ user });
				if (res.additionalUserInfo.isNewUser) {
          const timestamp = Number((new Date(user.metadata.creationTime)).getTime());
					userRef(user.uid).set({
						creationTime: timestamp,
            displayName: user.displayName,
            email: user.email,
						photoURL: user.photoURL,
						roles,
            stats,
            privacyAgreement: timestamp,
            uid: user.uid,
					});
				}
			}
		}).then(() => {
      if (this._isMounted) this.setState({ loading: false, redirectToReferrer: true });
		}).catch(err => {
      if (this._isMounted) this.setState({ loading: false }, () => openSnackbar(handleFirestoreError(err), 'error'))
    });
	}
	googleAuth = () => this.socialAuth(GoogleAuthProvider);
	facebookAuth = () => this.socialAuth(FacebookAuthProvider);
	twitterAuth = () => this.socialAuth(TwitterAuthProvider);

	render() {
    const { loading, redirectToReferrer } = this.state;
    const { disabled } = this.props;
    const { from } = {from: { pathname: '/' }};

		if (redirectToReferrer) return <Redirect to={from} />

		return (
			<div className="row" id="socialAuthComponent">
        <div className="col-4">
          <button type="button" disabled={disabled} className="btn google" onClick={this.googleAuth}>Google</button>
        </div>
        <div className="col-4">
          <button type="button" disabled={disabled} className="btn facebook" onClick={this.facebookAuth}>Facebook</button>
        </div>
        <div className="col-4">
          <button type="button" disabled={disabled} className="btn twitter" onClick={this.twitterAuth}>Twitter</button>
        </div>
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
      </div>
		);
	}
}