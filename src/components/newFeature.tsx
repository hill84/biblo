import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { app } from '../config/shared';
import DonationButtons from './donationButtons';

const NewFeature: FC = () => (
  <div className='container empty'>
    <div className='text-center'>
      <div className='pad-v'>
        <h2>Questa funzionalità non &egrave; ancora pronta</h2>
        <p>Aiutami a far crescere {app.name}. <span className='hide-sm'>Contribuisci con una donazione.</span></p>
        
        <div className='pad-v'>
          <DonationButtons />
        </div>
        
        <p className='font-sm'>
          <Link className='counter' to='/donations'>Perché &egrave; importante?</Link>
          <Link className='counter' to='/about'>Chi siamo</Link>
          <Link className='counter' to='/terms'>Termini</Link>
        </p>
      </div>
    </div>
  </div>
);
 
export default NewFeature;