import React, { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { objectType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import SignupForm from '../forms/signupForm';

const Signup = ({ location }) => {
  const { openSnackbar } = useContext(SnackbarContext);

  return (
    <div className="card-container pad-v" id="signupComponent">
      <Helmet>
        <title>{app.name} | Registrazione</title>
        <link rel="canonical" href={app.url} />
      </Helmet>
      <h2>Registrati</h2>
      <div className="card light">
        <SignupForm location={location} openSnackbar={openSnackbar} />
      </div>
      <div className="sub-footer">Hai già un account? <Link to="/login">Accedi</Link></div>
    </div>
  );
};

Signup.propTypes = {
  location: objectType.isRequired
}

export default Signup;