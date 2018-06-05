import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import BookCollection from '../bookCollection';

const Home = props => (
	<div id="homeComponent">
		<header className="hero pad-v">
			<div className="container">
				<h1>Scopriamo nuovi libri, insieme</h1>
				<p>Lorem ipsum dolor sit amet</p>
				{isAuthenticated() ? 
					<Link to={`/dashboard/${uid}`} className="btn primary lg">La tua libreria</Link> 
				: 
					<Link to="/signup" className="btn primary lg">Registrati</Link>
				}
			</div>
		</header>

		<div className="container">
			<div className="card dark">
				<BookCollection cid="Harry Potter" pagination={false} limit={7} scrollable={true} />
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
	</div>
);

export default Home;