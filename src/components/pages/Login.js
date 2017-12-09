import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../forms/LoginForm';

class Login extends React.Component {
	constructor(props){
		super(props);
		this.state = {}
	}

	submit = data => {
		console.log(data);
	}

	render(){
		return (
			<div>
				<h1>Login</h1>
				<Link to="/">Home</Link>
				<LoginForm submit={this.submit} />
			</div>
		);
	}
}

export default Login;