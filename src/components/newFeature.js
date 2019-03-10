import React from 'react';
import { Link } from 'react-router-dom';
import { appName } from '../config/shared';
import DonationButtons from './donationButtons';

export default class NewFeature extends React.Component {
  state = {
    isOpenPayments: false
  }

  onTogglePayments = () => {
    this.setState(prevState => ({
      isOpenPayments: !prevState.isOpenPayments
    }));
  }

  render() {
    // const { isOpenPayments } = this.state;

    return (
      <div className="container empty">
        <div className="text-center">
          <div className="pad-v">
            <h2>Questa funzionalità non è ancora pronta</h2>
            <p>Aiutami a far crescere {appName}. <span className="hide-sm">Contribuisci con una donazione.</span></p>
            
            <div className="pad-v">
              <DonationButtons />
            </div>
            
            <p className="font-sm">
              <Link className="counter" to="/donations">Perché è importante?</Link>
              <Link className="counter" to="/about">Chi siamo</Link>
              <Link className="counter" to="/terms">Termini</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }
}