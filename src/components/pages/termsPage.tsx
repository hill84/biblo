import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import withScrollToTop from '../hocs/withScrollToTop';

const TermsPage: FC = () => (
  <div id='TermsPageComponent' className='reveal fadeIn slideUp'>
    <Helmet>
      <title>{app.name} | Termini e condizioni d&apos;uso</title>
      <link rel='canonical' href={app.url} />
    </Helmet>
    <div className='container pad-v'>
      <h1>Termini e condizioni d&apos;uso</h1>
      <div className='text-justify text-left-sm'>
        <ol>
          <li>Questi termini e condizioni d&apos;uso si applicano all&apos;uso dei Servizi (come definito di seguito) compreso l&apos;utilizzo del sito web {app.url} (il &quot;Sito Web&quot;). All&apos;accesso al sito o all&apos;utilizzo dei Servizi o di qualsiasi software associato, si acconsente ad essere vincolati da questi termini e condizioni d&apos;uso, che si abbia un account o meno.</li>
          <li>Il presente documento comprende eventuali termini e condizioni aggiuntivi che potrebbero regolare la fruizione di un dato servizio (i &quot;Termini Aggiuntivi&quot;), inclusi (senza limitazioni) una licenza per l&apos;utente finale o termini promozionali o di concorrenza. In caso di conflitto fra i presenti termini e gli eventuali Termini Aggiuntivi, quest&apos;ultimi prevarranno sui primi.</li>
          <li>Non &egrave; consentito l&apos;utilizzo dei Servizi se l&apos;utente ha un&apos;età inferiore ai 13 anni. Se l&apos;utente ha un&apos;età compresa fra i 13 e i 18 anni, non può usufruire dei Servizi senza l&apos;autorizzazione di un genitore o un tutore legale.</li>
          <li>Ci riserviamo il diritto di aggiornare questi termini e condizioni d&apos;uso in qualsiasi momento senza alcun preavviso. In caso di modifiche dei presenti termini, pubblicheremo la versione aggiornata sul Sito Web. I termini aggiornati entreranno in vigore dalla prima volta che verranno pubblicati sul Sito Web e da allora in poi regoleranno i rapporti tra l&apos;utente e la società relativamente all&apos;utilizzo dei Servizi. Se non si &egrave; d&apos;accordo con i termini e le condizioni d&apos;uso aggiornate si &egrave; obbligati a interrompere l&apos;utilizzo dei Servizi dal momento in cui i termini aggiornati verranno pubblicati sul Sito Web.</li>
          <li>Ai fini del presente accordo:
            <ul>
              <li>con &quot;Norme sulla Privacy&quot; si fa riferimento alle norme che stabiliscono gli obblighi della società e dell&apos;utente relativamente alle informazioni personali fornite dall&apos;utente. Una copia delle suddette regole sono disponibili al seguente link: <Link to='/privacy'>Privacy policy</Link></li>
              <li>con &quot;Servizi&quot; si fa riferimento all&apos;insieme delle prestazioni fornite dal Sito Web e dalle pagine, informazioni, software, applicazioni, servizi, prodotti o contenuti che occasionalmente possono essere gestiti o ospitati dalla società;</li>
              <li>con &quot;Materiale di terze Parti&quot; si fa riferimento a qualsiasi contenuto, informazione, materiale, software e / o qualsiasi altro articolo o servizio citato appartenente a terzi, che sono collegati o resi accessibili dai servizi forniti dalla società;</li>
              <li>con &quot;Informazioni&quot; generate dall&apos;utente” si fa riferimento a qualsiasi informazione messa a disposizione ad altri utenti o alla società, compresi, in via esemplificativa, chat, post nei forum, nomi utenti, valutazioni, commenti a libri e altre recensioni, utilizzo di dati e suggerimenti su prodotti o servizi.</li>
            </ul>
          </li>
          <li>Non &egrave; possibile registrare un account automaticamente, compresi, in via esemplificativa, account registrati da bot.</li>
        </ol>
      </div>
    </div>
  </div>
);

export default withScrollToTop(TermsPage);