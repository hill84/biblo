import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
	<div id="homeComponent">
		<h2>Home</h2>
		<ul>
			<li><Link to="/login">Login</Link></li>
			<li><Link to="/signup">Signup</Link></li>
			<li><Link to="/password-reset">Reset password</Link></li>
			<li><Link to="/dashboard">Dashboard</Link></li>
			<li><Link to="/profile">Profile</Link></li>
		</ul>
	</div>
);

export default Home;