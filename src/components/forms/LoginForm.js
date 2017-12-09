import React from 'react';
import PropTypes from 'prop-types';
import { Form, Button } from 'semantic-ui-react';
import isEmail from 'validator/lib/isEmail';
import InlineError from '../messages/InlineError';

class LoginForm extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			data: {},
			loading: false,
			errors: {}
		};
	}

	onChange = e => {
		this.setState({ 
			data: { ...this.state.data, [e.target.name]: e.target.value }
		});
	};

	onSubmit = () => {
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
		if(!data.password) errors.password = "Inserisci una password";
		return errors;
	};

	render(){
		const { data, errors } = this.state;

		return(
			<Form onSubmit={this.onSubmit} noValidate>
				<Form.Field error={!!errors.email}>
					<label htmlFor="email">Email</label>
					<input 
						type="email" 
						id="email" 
						name="email" 
						placeholder="example@example.com" 
						value={data.email}
						onChange={this.onChange}
					/>
					{errors.email && <InlineError text={errors.email} />}
				</Form.Field>
				<Form.Field error={!!errors.password}>
					<label htmlFor="password">Password</label>
					<input 
						type="password" 
						id="password" 
						name="password" 
						placeholder="Almeno 8 caratteri" 
						value={data.password}
						onChange={this.onChange}
					/>
					{errors.password && <InlineError text={errors.password} />}
				</Form.Field>
				<Button primary>Login</Button>
			</Form>
		);
	}
}

LoginForm.propTypes = {
	submit: PropTypes.func.isRequired
}

export default LoginForm;