import React from 'react';
import { userType, stringType } from '../../config/types';
import { appName, calcAge, joinToLowerCase } from '../../config/shared';
import { Link } from 'react-router-dom';
import { Avatar } from 'material-ui';
import { Tabs, Tab } from 'material-ui/Tabs';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
/* 	constructor(props) {
		super(props);
		this.state = {}
	} */

	render(props) {
		const { user, uid } = this.props;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());
		/* 
		const objectName = (id, objs) => objs.map(obj => (obj.id === id) && obj.name);
		const arrNameMap = (arr, objs) => arr.map(item => <span key={item}>{objectName(item, objs)}</span> + '&nbsp;');
		const arrName = (id, objs) => <span key={id}>{objectName(id, objs)}</span>; 
		*/

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
									{user.languages && <span className="counter">Parla {joinToLowerCase(user.languages)}</span>}
									{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
									<span className="counter"><Link to="/profile">Modifica profilo</Link></span>
								</div>
								<div className="info-row">
									<span className="counter">Libri: <b>{user.shelf_num || 0}</b></span>
									<span className="counter">Wishlist: <b>{user.wishlist_num || 0}</b></span>
									<span className="counter">Valutazioni: <b>{user.ratings_num || 0}</b></span>
									<span className="counter">Recensioni: <b>{user.stats.reviews_num}</b></span>
								</div>
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