import React from 'react';
import { appName } from '../config/shared';

const Footer = () => (
  <footer>
    <div className="footer dark" id="FooterComponent">
      <div className="container pad-v">
        <p>Questo è un footer </p>
      </div>
      <div className="container">
        <hr className="divider" />
      </div>
      <div className="subfooter">
        <div className="container pad-v-sm">
          <p>Sub footer {appName}</p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;