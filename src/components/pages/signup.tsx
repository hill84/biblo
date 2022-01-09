import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import SignupForm from '../forms/signupForm';

const Signup: FC = () => (
  <div className='card-container pad-v' id='signupComponent'>
    <Helmet>
      <title>{app.name} | Registrazione</title>
      <link rel='canonical' href={app.url} />
    </Helmet>
    <h2>Registrati</h2>
    <div className='card light'>
      <SignupForm />
    </div>
    <div className='sub-footer'>Hai già un account? <Link to='/login'>Accedi</Link></div>
  </div>
);

export default Signup;