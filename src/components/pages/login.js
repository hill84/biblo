import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { locationType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import LoginForm from '../forms/loginForm';

const Login = ({ location }) => {
	const { openSnackbar } = useContext(SnackbarContext);
	
	return (
		<div className="card-container pad-v" id="loginComponent">
			<Helmet>
				<title>{app.name} | Login</title>
				<link rel="canonical" href={app.url} />
			</Helmet>
			<h2>Login</h2>
			<div className="card light">
				<LoginForm location={location} openSnackbar={openSnackbar} />
			</div>
			<Link to="/password-reset" className="sub-footer">Non ricordi la password?</Link>
		</div>
	);
};

export default Login;

Login.propTypes = {
  location: locationType.isRequired
}