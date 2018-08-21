import React from 'react';
import { icon } from '../config/icons';

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

    return (
      <div className="container empty">
        <div className="text-center">
          <h1>Questa funzionalità non è ancora pronta</h1>
          <p>Ti piacerebbe vederla realizzata? Contribuisci con una donazione.</p>
          <button className={`btn ${ isOpenPayments ? 'flat' : 'primary'}`} onClick={this.onTogglePayments}>Fai una donazione</button>
          {isOpenPayments && <div className="btns pad-v-sm fadeIn slideDown reveal">
            <button className="btn primary"><a target="_blank" rel="noopener noreferrer" href={coinbaseURL}>{icon.bitcoin()} Coinbase</a></button>
            <button className="btn primary" disabled href="/">{icon.paypal()} Paypal</button>
            <button className="btn primary" disabled href="/">{icon.creditCard()} Bonifico</button>
          </div>}
        </div>
      </div>
    );
  }
}