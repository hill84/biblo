import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { app } from '../config/shared';
import '../css/footer.css';

const Footer: FC = () => (
  <footer className='bottom-bar dark'>
    <div className='container bottompend pad-v-xs'>
      <div className='row'>
        <div className='col hide-md'><p>© {app.name} {new Date().getFullYear()}</p></div>
        <div className='col-md-auto col-12 text-center-md text-right'>
          <ul className='nolist inline-items info-row'>
            <li className='counter'><Link to='/about'>Chi siamo</Link></li>
            <li className='counter'><Link to='/terms'>Termini <span className='hide-md'>e condizioni</span></Link></li>
            <li className='counter'><Link to='/privacy'>Privacy <span className='hide-md'>policy</span></Link></li>
            <li className='counter'><Link to='/cookie'>Cookie <span className='hide-md'>policy</span></Link></li>
            <li className='counter'><Link to='/help'>Aiuto</Link></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;