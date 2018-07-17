import React from 'react';
import Link from 'react-router-dom/Link';
import { appName } from '../config/shared';

const Footer = () => (
  <footer>
    <div className="footer dark" id="FooterComponent">
      <div className="container pad-v-sm">
        <div className="row">
          <div className="col hide-md"><p>© {appName} 2018</p></div>
          <div className="col-md-auto col-12 text-center-md text-right">
            <ul className="nolist inline-items info-row">
              <li className="counter"><Link to="/chi-siamo">Chi siamo</Link></li>
              <li className="counter"><Link to="/termini">Termini <span className="hide-md">e condizioni</span></Link></li>
              <li className="counter"><Link to="/privacy">Privacy <span className="hide-md">policy</span></Link></li>
              <li className="counter"><Link to="/cookie">Cookie <span className="hide-md">policy</span></Link></li>
              <li className="counter"><Link to="/aiuto">Aiuto</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;