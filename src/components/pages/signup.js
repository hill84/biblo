import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { funcType, objectType } from '../../config/types';
import SignupForm from '../forms/signupForm';

const Signup = React.forwardRef((props, ref) => (
  <div className="card-container pad-v" id="signupComponent" ref={ref}>
    <Helmet>
      <title>{app.name} | Signup</title>
    </Helmet>
    <h2>Registrati</h2>
    <div className="card light">
      <SignupForm location={props.location} openSnackbar={props.openSnackbar} />
    </div>
    <div className="sub-footer">Hai già un account? <Link to="/login">Accedi</Link></div>
  </div>
));

Signup.propTypes = {
  location: objectType.isRequired,
  openSnackbar: funcType.isRequired
}

export default Signup;