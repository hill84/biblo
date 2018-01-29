import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
	<div id="homeComponent">
		<h2>Home</h2>
		<div className="card">
			<ul>
				<li><Link to="/login">Login</Link></li>
				<li><Link to="/signup">Signup</Link></li>
				<li><Link to="/password-reset">Reset password</Link></li>
				<li><Link to="/dashboard">Dashboard</Link></li>
				<li><Link to="/books/add">Add book</Link></li>
				<li><Link to="/profile">Profile</Link></li>
				<li><Link to="/error404">No match</Link></li>
			</ul>
		</div>
	</div>
);

export default Home;