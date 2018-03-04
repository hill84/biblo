import React from 'react';
import { stringType } from '../../config/types';
import { Link } from 'react-router-dom';

export default class Home extends React.Component {
	constructor(props){
		super(props);
		this.state = {}
	}

	render() {
		return (
			<div className="container" id="homeComponent">
				<h2>Home</h2>
				<div className="card">
					<ul>
						<li><Link to="/login">Login</Link></li>
						<li><Link to="/signup">Signup</Link></li>
						<li><Link to="/password-reset">Reset password</Link></li>
						<li><Link to={`/dashboard/${this.props.uid}`}>Dashboard</Link></li>
						<li><Link to="/books/add">Add book</Link></li>
						<li><Link to="/new-book">New book</Link></li>
						<li><Link to="/profile">Profile</Link></li>
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