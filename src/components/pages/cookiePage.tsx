import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { app } from '../../config/shared';
import BooksRowDivider from '../booksRowDivider';
import withScrollToTop from '../hocs/withScrollToTop';

const CookiePage: FC = () => (
  <div id='CookiePageComponent' className='reveal fadeIn slideUp'>
    <Helmet>
      <title>{app.name} | Cookie policy</title>
      <meta name='description' content={app.desc} />
      <link rel='canonical' href={app.url} />
    </Helmet>
    <div className='container pad-v'>
      <h1>Cookie policy</h1>
      <p className='lighter-text'>Data di entrata in vigore: 10 Marzo 2019</p>
    
      <BooksRowDivider />

      <div className='text-justify text-left-sm'>
        <h2>Cosa sono i cookie?</h2>
        <p>I cookie sono informazioni che vengono archiviate sul tuo dispositivo attraverso il browser e possono includere un identificativo univoco anonimo. Questi dati permettono ai proprietari dei siti di conservare le tue preferenze e mostrarti informazioni personalizzate durante le visite successive sulle pagine web.</p>
        <p>{app.name} utilizza cookie e tecnologie di tracciamento simili per conservare alcune informazioni.</p>

        <h3>Cookie tecnici e per fini statistici</h3>
        <p>Questi cookie vengono utilizzati per tracciare la sessione utente e svolgere altre attività strettamente necessarie al funzionamento del sito, ad esempio in relazione alla distribuzione del traffico. Tali cookie sono installati senza l’obbligo del tuo consenso preventivo. Bloccandoli potresti incorrere in errori e visualizzare il sito in maniera non ottimale.</p>

        <h3>Cookie di terze parti</h3>
        <p>Durante la navigazione sul sito potresti memorizzare cookie di terze parti, come altri servizi, siti e piattaforme di social network. Questi cookie sono da intendersi per fini statistici e di marketing, oltre che per monitorare la tua interazione con i social network. Di seguito troverai una lista di tali servizi forniti da terze parti. Se continui la navigazione sul sito e usi i nostri servizi senza cambiare le impostazioni del browser, darai tacito consenso per la memorizzazione di tali cookie.</p>

        <p><b>Google Analytics</b> &egrave; un servizio di analisi web fornito da Google che permette di tracciare in maniera anonima l&apos;attività online dei nostri utenti e il loro comportamento durante la navigazione sul sito. Luogo di elaborazione: US – <a href='https://www.google.com/intl/en/policies/privacy/' target='_blank' rel='noopener noreferrer'>Privacy Policy</a></p>

        <h2>Come gestire l&apos;installazione dei Cookie</h2>
        <p>Per gestire le tue preferenze sui cookie, puoi agire sulle impostazioni del tuo browser, ad esempio, chiedendogli di evitare l&apos;installazione dei cookie di terze parti. Attraverso le impostazione del browser &egrave; anche possibile cancellare i cookie installati in precedenza. &egrave; importante ricordare che disabilitando tutti i cookie, il funzionamento del sito potrebbe risultarne compromesso. Puoi trovare maggiori informazioni sulla gestione dei cookie nel browser ai seguenti link:</p>
        <ul>
          <li>Google Chrome - <a href='https://support.google.com/chrome/answer/95647?hl=en&amp;p=cpn_cookies' target='_blank' rel='noopener noreferrer'>Info</a></li>
          <li>Mozilla Firefox - <a href='https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences' target='_blank' rel='noopener noreferrer'>Info</a></li>
          <li>Safari - <a href='https://support.apple.com/en-us/HT201265' target='_blank' rel='noopener noreferrer'>Info</a></li>
          <li>Microsoft Windows Explorer - <a href='https://windows.microsoft.com/en-us/windows-vista/block-or-allow-cooki%3Ees' target='_blank' rel='noopener noreferrer'>Info</a></li>
        </ul>

        <h2>I tuoi diritti</h2>
        <p>Hai il diritto di conoscere in qualsiasi momento se i tuoi dati personali sono stati conservati e puoi rivolgerti al Titolare per conoscere il contenuto e l&apos;origine dei dati, verificarne l&apos;esattezza o chiederne l&apos;integrazione, la cancellazione, l&apos;aggiornamento, la rettifica, la trasformazione in forma anonima o il blocco dei dati trattati in violazione di legge, nonché di opporti al loro trattamento per qualsiasi motivo legittimo. Le richieste vanno rivolte al Titolare del trattamento presso l&apos;indirizzo indicato. Se ritieni che i tuoi diritti siano stati violati, ha il diritto di presentare un reclamo all&apos;Autorità di Vigilanza italiana o a qualsiasi altra autorità di vigilanza nell&apos;Unione Europea. Data l&apos;oggettiva complessità legata all&apos;identificazione di tecnologie basate su cookie e la loro strettissima integrazione con il funzionamento del sito, sei invitato a contattare il Titolare qualora desideri ricevere ulteriori informazioni sull&apos;utilizzo dei cookie stessi e sull&apos;eventuale utilizzo degli stessi - ad esempio da parte di terzi - effettuato attraverso il Sito.</p>

        <h2>Contatti</h2>
        <p>Email: <a href={`mailto:${app.privacyEmail}?subject=Biblo: Cookie`}>{app.privacyEmail}</a></p>
      </div>
    </div>
  </div>
);

export default withScrollToTop(CookiePage);