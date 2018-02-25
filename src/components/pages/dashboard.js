import React from 'react';
import { userRef } from '../../config/firebase';
import { userType, stringType } from '../../config/types';
import { appName, calcAge, join } from '../../config/shared';
import { Link } from 'react-router-dom';
import { Avatar } from 'material-ui';
import { Tabs, Tab } from 'material-ui/Tabs';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
 	constructor(props) {
		super(props);
		this.state = {
			uid: this.props.uid,
			user: this.props.user,
			loading: false
		}
	}

	componentWillReceiveProps(props) {
		if (this.props.user) {
			this.setState({
				user: this.props.user,
				uid: this.props.uid
			});
		}
	}

	componentDidMount(props) {
		if (this.props.match.params.uid) {
			userRef(this.props.match.params.uid).onSnapshot(snap => {
				this.setState({ loading: false });
				if (snap.exists) {
					this.setState({
						user: snap.data(),
						uid: this.props.match.params.uid
					});
				}
			});
		}
	}

	render(props) {
		const { user, uid } = this.state;
		const { match } = this.props;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());

		if (!user || !uid) return null

		return (
			<div ref="dashboardComponent">	
				<h2>Dashboard</h2>
				<div className="card">
					<div className="basic-profile">
						<div className="row">
							<div className="col-auto">
								{user.photoURL ? 
									<Avatar src={user.photoURL} size={100} backgroundColor={'transparent'} /> 
								: user.displayName && 
									<Avatar size={100}>{user.displayName.charAt(0)}</Avatar> 
								}
							</div>
							<div className="col">
								<div className="username">{user.displayName}</div>
								<div className="info-row">
									{user.sex && <span className="counter">{user.sex === 'm' ? 'Uomo' : user.sex === 'f' ? 'Donna' : 'Altro'}</span>}
									{user.birth_date && <span className="counter">{calcAge(user.birth_date)} anni</span>}
									{user.city && <span className="counter">{user.city}</span>}
									{user.country && <span className="counter">{user.country}</span>}
									{user.continent && <span className="counter">{user.continent}</span>}
									{user.languages[0] && <span className="counter">Parla {join(user.languages).toLowerCase()}</span>}
									{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
									<span className="counter"><Link to="/profile">Modifica profilo</Link></span>
								</div>
								<div className="info-row">
									<span className="counter">Libri: <b>{user.stats.shelf_num || 0}</b></span>
									<span className="counter">Wishlist: <b>{user.stats.wishlist_num || 0}</b></span>
									<span className="counter">Valutazioni: <b>{user.stats.ratings_num || 0}</b></span>
									<span className="counter">Recensioni: <b>{user.stats.reviews_num || 0}</b></span>
									<span className="counter">Seguito da: <b>{user.stats.followers_num || 0}</b></span>
									<span className="counter">Segue: <b>{user.stats.followed_num || 0}</b></span>
								</div>
								{uid !== match.params.uid &&
									<div className="info-row">
										<button className="btn primary">Segui {user.displayName}</button>
									</div>
								}
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

Dashboard.propTypes = {
	uid: stringType,
	user: userType
}