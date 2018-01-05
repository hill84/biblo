import React from 'react';
import { appName, userAge } from '../../config/shared';
import { auth, userRef } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { Avatar } from 'material-ui';
import { Tabs, Tab } from 'material-ui/Tabs';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uid: '',
			user: {}
		}
	}

	componentDidMount() {
		auth.onAuthStateChanged(user => {
			if (user) {
				userRef(user.uid).on('value', snap => {
					this.setState({
						uid: user.uid,
						user: snap.val()
					});
				});
			}
		});
	}

	render(props) {
		const { user, uid } = this.state;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());

		return (
			<div id="dashboardComponent">
				<h2>Dashboard</h2>
				<div className="card">
					<div className="basic-profile">
						<div className="row">
							<div className="col-auto">
								{user.photoURL ? <Avatar src={user.photoURL} size={100} backgroundColor={'transparent'} /> : user.displayName && <Avatar size={100}>{user.displayName.charAt(0)}</Avatar> }
							</div>
							<div className="col">
								<p className="username">{user.displayName}</p>
								<p className="info-row">
									{user.sex && <span className="counter">{user.sex === 1 ? 'Uomo' : user.sex === 2 ? 'Donna' : 'Altro'}</span>}
									{user.birth_date && <span className="counter">{userAge(user.birth_date)} anni</span>}
									{user.location && <span className="counter">{user.location}</span>}
									{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
									<span className="counter"><Link to="/profile">Modifica profilo</Link></span>
								</p>
								<p className="info-row">
									<span className="counter">Libri: <b>{user.shelf_num || 0}</b></span>
									<span className="counter">Wishlist: <b>{user.wishlist_num || 0}</b></span>
									<span className="counter">Valutazioni: <b>{user.ratings_num || 0}</b></span>
									<span className="counter">Recensioni: <b>{user.reviews_num || 0}</b></span>
								</p>
							</div>
						</div>
						
					</div>
				</div>

				<Tabs style={{marginTop: 20}} tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
					<Tab label="Libreria">
						<Shelf user={user} uid={uid} />
					</Tab>
					<Tab label="Attività">
						<div id="activitiesComponent">
							<div className="card bottompend">
								<p>Attività</p>
							</div>
						</div>
					</Tab>
					<Tab label="Contatti">
						<div id="contactsComponent">
							<div className="card bottompend">
								<p>Contatti</p>
							</div>
						</div>
					</Tab>
				</Tabs>
			</div>
		);
	}
}