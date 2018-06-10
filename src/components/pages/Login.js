import React from 'react';
import Link from 'react-router-dom/Link';
import LoginForm from '../forms/loginForm';

const Login = props => (
	<div className="card-container" id="loginComponent">
		<h2>Login</h2>
		<div className="card">
			<LoginForm location={props.location} />
		</div>
		<Link to="/password-reset" className="sub-footer">Non ricordi la password?</Link>
	</div>
);

export default Login;