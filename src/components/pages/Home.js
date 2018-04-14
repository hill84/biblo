import React from 'react';
import { Link } from 'react-router-dom';
import { uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import BookCollection from '../bookCollection';

const Home = props => (
	<div className="container" id="homeComponent">
		<div className="card dark">
			<BookCollection cid="Harry Potter" limit={7} scrollable={true} />
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
);

export default Home;