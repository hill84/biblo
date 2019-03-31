import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../forms/loginForm';
import { funcType, objectType } from '../../config/types';

const Login = props => (
	<div className="card-container pad-v" id="loginComponent">
		<h2>Login</h2>
		<div className="card">
			<LoginForm location={props.location} openSnackbar={props.openSnackbar} />
		</div>
		<Link to="/password-reset" className="sub-footer">Non ricordi la password?</Link>
	</div>
);

export default Login;

Login.protoTypes = {
  location: objectType.isRequired,
  openSnackbar: funcType.isRequired
}