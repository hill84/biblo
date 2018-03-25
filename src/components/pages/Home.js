import React from 'react';
import { local_uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import { stringType } from '../../config/types';
import { Link } from 'react-router-dom';
import BookCollection from '../bookCollection';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uid: local_uid || ''
		}
	}

	render() {
		const { uid } = this.state;
		
		return (
			<div className="container" id="homeComponent">
				<div className="card dark">
					<BookCollection cid="Harry Potter" bcid="bcid" limit={7} scrollable={true}/>
				</div>

				<div className="card">
					<ul>
						<li><Link to="/login">{icon.loginVariant()} Login</Link></li>
						<li><Link to="/signup">{icon.accountPlus()} Signup</Link></li>
						<li><Link to="/password-reset">{icon.lockReset()} Reset password</Link></li>
						<li><Link to={`/dashboard/${uid}`}>{icon.dashboard()} Dashboard</Link></li>
						<li><Link to="/books/add">{icon.plusCircle()} Add book</Link></li>
						<li><Link to="/new-book">{icon.newBox()} New book</Link></li>
						<li><Link to="/profile">{icon.accountCircle()} Profile</Link></li>
						<li><Link to="/error404">No match</Link></li>
					</ul>
				</div>
			</div>
		)
	}
}

Home.propTypes = {
	uid: stringType
}