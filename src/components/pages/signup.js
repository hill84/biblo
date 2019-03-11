import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../forms/signupForm';
import { funcType, objectType } from '../../config/types';

const Signup = props => (
  <div className="card-container pad-v" id="signupComponent">
    <h2>Registrati</h2>
    <div className="card">
      <SignupForm location={props.location} openSnackbar={props.openSnackbar} />
    </div>
    <div className="sub-footer">Hai già un account? <Link to="/login">Accedi</Link></div>
  </div>
);

Signup.propTypes = {
  location: objectType.isRequired,
  openSnackbar: funcType.isRequired
}

export default Signup;