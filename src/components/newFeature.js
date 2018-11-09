import React from 'react';
import { Link } from 'react-router-dom';
import { icon } from '../config/icons';
import { appName } from '../config/shared';

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
    const { isOpenPayments } = this.state;
    const coinbaseURL = 'https://commerce.coinbase.com/checkout/d54258df-5760-4663-909f-324ddfacc5b6';
    const paypalURL = 'https://paypal.me/bibloapp';

    return (
      <div className="container empty">
        <div className="text-center">
          <div className="pad-v">
            <h2>Questa funzionalità non è ancora pronta</h2>
            <p>Aiutami a far crescere {appName}. <span className="hide-sm">Contribuisci con una donazione.</span></p>
            <p>
              <button className={`btn ${ isOpenPayments ? 'flat' : 'primary'}`} onClick={this.onTogglePayments}>Fai una donazione</button>
              {isOpenPayments && 
                <div className="btns pad-v-sm fadeIn slideDown reveal">
                  <button type="button" className="btn primary"><a target="_blank" rel="noopener noreferrer" href={coinbaseURL}>{icon.bitcoin()} Coinbase</a></button>
                  <button type="button" className="btn primary"><a target="_blank" rel="noopener noreferrer" href={paypalURL}>{icon.paypal()} Paypal</a></button>
                  <button type="button" className="btn primary" disabled><a href="/">{icon.creditCard()} Bonifico</a></button>
                </div>
              }
            </p>
          </div>
          <p className="font-sm">
            <Link className="counter" to="/donations">Perché è importante?</Link>
            <Link className="counter last" to="/terms">Termini</Link>
          </p>
        </div>
      </div>
    );
  }
}