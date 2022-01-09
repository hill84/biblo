import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { app } from '../../config/shared';
import DonationButtons from '../donationButtons';
import withScrollToTop from '../hocs/withScrollToTop';

const DonationsPage: FC = () => (
  <div id='DonationsPageComponent' className='reveal fadeIn slideUp'>
    <Helmet>
      <title>{app.name} | Donazioni</title>
      <meta name='description' content={app.desc} />
      <link rel='canonical' href={app.url} />
    </Helmet>
    <div className='container pad-v'>
      <h1>Donazioni</h1>
      <div className='text-justify text-left-sm'>
        <p>{app.name} &egrave; un progetto personale, creato e gestito senza finanziamenti esterni, ma con dei costi di messa in opera, manutenzione e distribuzione. Le donazioni degli utenti sono quindi indispensabili per mantere {app.name} un servizio <span className='accent-text'>gratuito, senza limitazioni e pubblicità</span> invasive. Su {app.name} non raccogliamo informazioni personali per rivenderle a terze parti e teniamo in grande considerazione la privacy dei nostri utenti. La nostra missione &egrave; unire i lettori in un luogo dove trovare e condividere informazioni sui libri per promuovere e diffondere la passione per la letteratura. Se ti piace il progetto e vuoi aiutarci a farlo crescere, <span className='accent-text'>contribuisci con una donazione</span> (bastano pochi euro).</p>
      </div>

      <div className='text-center'>
        <div className='pad-v'>
          <h2>Fai crescere {app.name}</h2>
          <DonationButtons />
        </div>
      </div>
    </div>
  </div>
);

export default withScrollToTop(DonationsPage);