import React from 'react';
import { Link } from 'react-router-dom';
import { appName } from '../../config/shared';

const TermsPage = props => (
    <div id="TermsPageComponent" className="reveal fadeIn slideUp">
      <div className="container pad-v">
        <h2>Termini e condizioni d'uso</h2>
        <div className="text-justify text-left-sm">
          <ol>
            <li>Questi termini e condizioni d'uso si applicano all'uso dei Servizi (come definito di seguito) compreso l'utilizzo del sito web {appName}.com (il "Sito Web"). All'accesso al sito o all'utilizzo dei Servizi o di qualsiasi software associato, si acconsente ad essere vincolati da questi termini e condizioni d'uso, che si abbia un account o meno.</li>
            <li>Il presente documento comprende eventuali termini e condizioni aggiuntivi che potrebbero regolare la fruizione di un dato servizio (i "Termini Aggiuntivi"), inclusi (senza limitazioni) una licenza per l'utente finale o termini promozionali o di concorrenza. In caso di conflitto fra i presenti termini e gli eventuali Termini Aggiuntivi, quest'ultimi prevarranno sui primi.</li>
            <li>Non è consentito l'utilizzo dei Servizi se l'utente ha un'età inferiore ai 13 anni. Se l'utente ha un'età compresa fra i 13 e i 18 anni, non può usufruire dei Servizi senza l'autorizzazione di un genitore o un tutore legale.</li>
            <li>Ci riserviamo il diritto di aggiornare questi termini e condizioni d'uso in qualsiasi momento senza alcun preavviso. In caso di modifiche dei presenti termini, pubblicheremo la versione aggiornata sul Sito Web. I termini aggiornati entreranno in vigore dalla prima volta che verranno pubblicati sul Sito Web e da allora in poi regoleranno i rapporti tra l'utente e la società relativamente all'utilizzo dei Servizi. Se non si è d'accordo con i termini e le condizioni d'uso aggiornate si è obbligati a interrompere l'utilizzo dei Servizi dal momento in cui i termini aggiornati verranno pubblicati sul Sito Web.</li>
            <li>Ai fini del presente accordo:
              <ul>
                <li>con "Norme sulla Privacy" si fa riferimento alle norme che stabiliscono gli obblighi della società e dell'utente relativamente alle informazioni personali fornite dall'utente. Una copia delle suddette regole sono disponibili al seguente link: <Link to="/privacy">Privacy policy</Link></li>
                <li>con "Servizi" si fa riferimento all'insieme delle prestazioni fornite dal Sito Web e dalle pagine, informazioni, software, applicazioni, servizi, prodotti o contenuti che occasionalmente possono essere gestiti o ospitati dalla società;</li>
                <li>con "Materiale di terze Parti" si fa riferimento a qualsiasi contenuto, informazione, materiale, software e / o qualsiasi altro articolo o servizio citato appartenente a terzi, che sono collegati o resi accessibili dai servizi forniti dalla società;</li>
                <li>con "Informazioni" generate dall'utente” si fa riferimento a qualsiasi informazione messa a disposizione ad altri utenti o alla società, compresi, in via esemplificativa, chat, post nei forum, nomi utenti, valutazioni, commenti a libri e altre recensioni, utilizzo di dati e suggerimenti su prodotti o servizi.</li>
              </ul>
            </li>
            <li>Non è possibile registrare un account automaticamente, compresi, in via esemplificativa, account registrati da bot.</li>
          </ol>
        </div>
      </div>
    </div>
  );

export default TermsPage;