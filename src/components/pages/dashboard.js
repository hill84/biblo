import React from 'react';
import { auth, db } from '../../config/firebase.js';

export default class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {
				uid: '123456',
				displayName: '',
				email: '',
				photoURL: '',
				registration_date: null,
				shelf_num: 0,
				wishlist_num: 0
			}
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			this.setState({ user });
			const uid = this.state.user.uid || '123456';

			const userRef = db.ref().child('user').child(uid);
			userRef.on('value', snap => {
				this.setState({
					user: snap.val()
				});
			});
		});
	}

	render() {
		const { user } = this.state;
		return (
			<div id="dashboardComponent">
				<h2>Dashboard</h2>
				<div className="card">
					<p>{user.displayName}</p>
					<p>Libri: {user.shelf_num} - Wishlist: {user.wishlist_num}</p>
				</div>
			</div>
		);
	}
}