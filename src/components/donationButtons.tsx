import React, { FC } from 'react';
import icon from '../config/icons';

const coinbaseURL = 'https://commerce.coinbase.com/checkout/d54258df-5760-4663-909f-324ddfacc5b6';
const paypalURL = 'https://paypal.me/bibloapp';
const buymeacoffeeURL = 'https://buymeacoffee.com/biblo';

const DonationButtons: FC = () => (
  <div className='donation-btns'>
    <button type='button' className='btn primary rounded'><a target='_blank' rel='noopener noreferrer' href={buymeacoffeeURL}>{icon.coffee} Buy me a coffee</a></button>
    <button type='button' className='btn primary rounded'><a target='_blank' rel='noopener noreferrer' href={coinbaseURL}>{icon.bitcoin} Coinbase</a></button>
    <button type='button' className='btn primary rounded'><a target='_blank' rel='noopener noreferrer' href={paypalURL}>{icon.paypal} Paypal</a></button>
    {/* <button type='button' className='btn primary rounded' disabled><a href='/'>{icon.creditCard} Bonifico</a></button> */}
  </div>
);

export default DonationButtons;