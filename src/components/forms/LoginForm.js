import React from 'react';
import PropTypes from 'prop-types';
import isEmail from 'validator/lib/isEmail';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class LoginForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			data: {},
			loading: false,
			errors: {}
		};
	}

	handleChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	handleSubmit = () => {
		const errors = this.validate(this.state.data);
		this.setState({ errors });
		if(Object.keys(errors).length === 0){
			this.props.submit(this.state.data);
		}
	};

	validate = data => {
		const errors = {};
		if(data.email){
			if(!isEmail(data.email)) errors.email = "Email non valida";
		} else {
			errors.email = "Inserisci un indirizzo email";
		}
		if(!data.password){ 
			errors.password = "Inserisci una password";
		} else if(data.password.length < 8){
			errors.password = "Password troppo corta";
		}
		return errors;
	};

	render(){
		const { data, errors } = this.state;

		return(
			<form onSubmit={this.onSubmit} noValidate id="loginFormComponent">
				<div>
					<TextField
						name="email"
						type="email"
						hintText="esempio@esempio.com"
						errorText={errors.email}
						floatingLabelText="Email"
						value={data.email}
						onChange={this.handleChange}
					/>
				</div>

				<div>
					<TextField
						name="password"
						type="password"
						hintText="Almeno 8 caratteri"
						errorText={errors.password}
						floatingLabelText="Password"
						value={data.password}
						onChange={this.handleChange}
					/>
				</div>

				<div>
					<RaisedButton 
						label="Login" 
						primary={true} 
						onClick={this.handleSubmit}
					/>
				</div>
			</form>
		);
	}
}

LoginForm.propTypes = {
	submit: PropTypes.func.isRequired
}

export default LoginForm;