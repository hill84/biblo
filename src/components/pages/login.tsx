import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, RouteComponentProps } from 'react-router-dom';
import { app } from '../../config/shared';
import LoginForm from '../forms/loginForm';

const Login: FC<RouteComponentProps> = ({ location }: RouteComponentProps) => (
  <div className='card-container pad-v' id='loginComponent'>
    <Helmet>
      <title>{app.name} | Login</title>
      <link rel='canonical' href={app.url} />
    </Helmet>
    <h2>Login</h2>
    <div className='card light'>
      <LoginForm location={location} />
    </div>
    <Link to='/password-reset' className='sub-footer'>Non ricordi la password?</Link>
  </div>
);

export default Login;