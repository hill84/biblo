import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { appName } from '../../config/shared';
import { funcType, objectType } from '../../config/types';
import LoginForm from '../forms/loginForm';

const Login = React.forwardRef((props, ref) => (
	<div className="card-container pad-v" id="loginComponent" ref={ref}>
    <Helmet>
      <title>{appName} | Login</title>
    </Helmet>
		<h2>Login</h2>
		<div className="card light">
			<LoginForm location={props.location} openSnackbar={props.openSnackbar} />
		</div>
		<Link to="/password-reset" className="sub-footer">Non ricordi la password?</Link>
	</div>
));

export default Login;

Login.protoTypes = {
  location: objectType.isRequired,
  openSnackbar: funcType.isRequired
}