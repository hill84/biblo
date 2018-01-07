import React from 'react';
import PropTypes from 'prop-types';
import { appName, userAge } from '../../config/shared';
import { Link } from 'react-router-dom';
import { Avatar } from 'material-ui';
import { Tabs, Tab } from 'material-ui/Tabs';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = { }
	}

	render(props) {
		const { user, uid } = this.props;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());

		if (!user && !uid) return null

		return (
			<div id="dashboardComponent">
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

Dashboard.propTypes = {
	uid: PropTypes.string,
	user: PropTypes.shape({
			birth_date: PropTypes.string,
			creationTime: PropTypes.string.isRequired,
			displayName: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired,
			location: PropTypes.string,
			photoURL: PropTypes.string,
			sex: PropTypes.number,
			shelf_num: PropTypes.number,
			wishlist_num: PropTypes.number,
			ratings_num: PropTypes.number,
			reviews_num: PropTypes.number
	})
}