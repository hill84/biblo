import React from 'react';
import { Helmet } from 'react-helmet';
import { appDesc, appName } from '../../config/shared';
import DonationButtons from '../donationButtons';

const seo = {
  title: `${appName} | Donazioni`,
  description: appDesc
}

const DonationsPage = React.forwardRef((props, ref) => (
  <div id="DonationsPageComponent" className="reveal fadeIn slideUp" ref={ref}>
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
    </Helmet>
    <div className="container pad-v">
      <h1>Donazioni</h1>
      <div className="text-justify text-left-sm">
        <p>{appName} è un progetto personale di <a href="http://www.giuseppegerbino.com">Giuseppe Gerbino</a>, creato e gestito senza finanziamenti esterni, ma con dei costi di messa in opera, manutenzione e distribuzione. Le donazioni degli utenti sono quindi indispensabili per mantere {appName} un servizio <span className="accent-text">gratuito, senza limitazioni e pubblicità</span> invasive. Su {appName} non raccogliamo le tue informazioni per rivenderle a terze parti, non sfruttiamo i tuoi dati per fare soldi. La nostra missione è unire i lettori in un luogo dove trovare e condividere informazioni sui libri che amiamo per diffondere la passione per la lettura e la letteratura. Se ti piace il progetto e vuoi aiutarmi a farlo crescere, <span className="accent-text">contribuisci con una donazione</span> (bastano pochi euro).</p>
      </div>

      <div className="text-center">
        <div className="pad-v">
          <h2>Fai crescere {appName}</h2>
          <DonationButtons />
        </div>
      </div>
    </div>
  </div>
));

export default DonationsPage;