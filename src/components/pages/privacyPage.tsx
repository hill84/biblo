import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { app } from '../../config/shared';
import BooksRowDivider from '../booksRowDivider';
import withScrollToTop from '../hocs/withScrollToTop';

const PrivacyPage: FC = () => (
  <div id='PrivacyPageComponent' className='reveal fadeIn slideUp'>
    <Helmet>
      <title>{app.name} | Privacy policy</title>
      <link rel='canonical' href={app.url} />
    </Helmet>
    <div className='container pad-v'>
      <h1>Privacy policy</h1>
      <p className='lighter-text'>Data di entrata in vigore: 10 Marzo 2019</p>
      
      <BooksRowDivider />
      
      <div className='text-justify text-left-sm'>
        <p>{app.name} gestisce il sito web {app.url} (di seguito il &quot;Servizio&quot;).</p>
        <p>Questa pagina vi informa delle nostre politiche riguardanti la raccolta, l&apos;uso e la divulgazione dei dati personali quando usate il nostro Servizio e le scelte che avete associato a quei dati.</p>
        <p>Utilizziamo i vostri dati per fornire e migliorare il Servizio. Utilizzando il Servizio, accettate la raccolta e l&apos;utilizzo delle informazioni in conformità con questa informativa. Se non diversamente definito nella presente Informativa sulla privacy, i termini utilizzati nella presente Informativa hanno la stessa valenza dei nostri <a href='/terms'>Termini e condizioni</a>.</p>
        <h2>Definizioni</h2>
        <ul>
          <li><p><span className='accent-text'>Servizio</span>: Il Servizio &egrave; il sito {app.url} gestito da {app.name}</p></li>
          <li><p><span className='accent-text'>Dati personali</span>: I Dati personali sono i dati di un individuo vivente che può essere identificato da quei dati (o da quelli e altre informazioni in nostro possesso o che potrebbero venire in nostro possesso).</p></li>
          <li><p><span className='accent-text'>Dati di utilizzo</span>: I dati di utilizzo sono i dati raccolti automaticamente generati dall&apos;utilizzo del Servizio o dall&apos;infrastruttura del Servizio stesso (ad esempio, la durata della visita di una pagina).</p></li>
          <li><p><span className='accent-text'>Cookies</span>: I cookie sono piccoli file memorizzati sul vostro dispositivo (computer o dispositivo mobile).</p></li>
        </ul>

        <h2>Raccolta e uso delle informazioni</h2>
        <p>Raccogliamo diversi tipi di informazioni per vari scopi, per fornire e migliorare il nostro servizio.</p>

        <h3>Tipologie di Dati raccolti</h3>

        <h4>Dati personali</h4>
        <p>Durante l&apos;utilizzo del nostro Servizio, potremmo chiedervi di fornirci alcune informazioni di identificazione personale che possono essere utilizzate per contattarvi o identificarvi (&quot;Dati personali&quot;). Le informazioni di identificazione personale possono includere, ma non sono limitate a:</p>

        <ul>
          <li>Indirizzo email</li>
          <li>Nominativo (nome e cognome o nickname)</li>
          <li>Indirizzo, stato, provincia, città</li>
          <li>Cookie e dati di utilizzo</li>
        </ul>

        <h4>Dati di utilizzo</h4>
        <p>Potremmo anche raccogliere informazioni su come l&apos;utente accede e utilizza il Servizio (&quot;Dati di utilizzo&quot;). Questi Dati di utilizzo possono includere informazioni quali l&apos;indirizzo del protocollo Internet del computer (ad es. Indirizzo IP), il tipo di browser, la versione del browser, le pagine del nostro servizio che si visita, l&apos;ora e la data della visita, il tempo trascorso su tali pagine, identificatore unico del dispositivo e altri dati diagnostici.</p>

        <h4>Tracciamento: dati dei cookie</h4>
        <p>Utilizziamo cookie e tecnologie di tracciamento simili per tracciare l&apos;attività sul nostro Servizio e conservare determinate informazioni.</p>
        <p>I cookie sono file con una piccola quantità di dati che possono includere un identificatore univoco anonimo. I cookie vengono inviati al vostro browser da un sito web e memorizzati sul vostro dispositivo. Altre tecnologie di tracciamento che potrebbero essere utilizzate sono anche beacon, tag e script per raccogliere e tenere traccia delle informazioni e per migliorare e analizzare il nostro Servizio.</p>
        <p>Potete chiedere al vostro browser di rifiutare tutti i cookie o di indicare quando viene inviato un cookie. Tuttavia, se non si accettano i cookie, potrebbe non essere possibile utilizzare alcune parti del nostro Servizio.</p>
        <p>Esempi di cookie che utilizziamo:</p>
        <ul>
          <li><span className='accent-text'>Cookie di sessione.</span> Utilizziamo i cookie di sessione per gestire il nostro servizio.</li>
          <li><span className='accent-text'>Cookie di preferenza.</span> Utilizziamo i cookie di preferenza per ricordare le vostre preferenze e varie impostazioni.</li>
          <li><span className='accent-text'>Cookie di sicurezza.</span> Utilizziamo i cookie di sicurezza per motivi di sicurezza.</li>
        </ul>
        <p>Per maggiori informazioni consulta la nostra pagina <a href='/cookie'>Cookie policy</a></p>

        <h2>Uso dei dati</h2> 
        <p>{app.name} utilizza i dati raccolti per vari scopi:</p>    
        <ul>
          <li>Per fornire e mantenere il nostro Servizio</li>
          <li>Per comunicare agli utenti variazioni apportate al servizio che offriamo</li>
          <li>Per permettere agli utenti di fruire, a propria discrezione, di funzioni interattive del nostro servizio</li>
          <li>Per fornire un servizio ai clienti</li>
          <li>Per raccogliere analisi o informazioni preziose in modo da poter migliorare il nostro Servizio</li>
          <li>Per monitorare l&apos;utilizzo del nostro Servizio</li>
          <li>Per rilevare, prevenire e affrontare problemi tecnici</li>
        </ul>

        <h2>Trasferimento dei dati</h2>
        <p>Le vostre informazioni, compresi i Dati personali, possono essere trasferite a - e mantenute su - computer situati al di fuori del vostro stato, provincia, nazione o altra giurisdizione governativa dove le leggi sulla protezione dei dati possono essere diverse da quelle della vostra giurisdizione.</p>
        <p>Se ci si trova al di fuori dell&apos;Italia e si sceglie di fornire informazioni a {app.name}, si ricorda che trasferiamo i dati, compresi i dati personali, in Italia e li elaboriamo lì.</p>
        <p>Il vostro consenso alla presente Informativa sulla privacy seguito dall&apos;invio di tali informazioni rappresenta il vostro consenso al trasferimento.</p>
        <p>{app.name} adotterà tutte le misure ragionevolmente necessarie per garantire che i vostri dati siano trattati in modo sicuro e in conformità con la presente Informativa sulla privacy e nessun trasferimento dei vostri Dati Personali sarà effettuato a un&apos;organizzazione o a un paese a meno che non vi siano controlli adeguati dei vostri dati e altre informazioni personali.</p>

        <h2>Divulgazione di dati</h2>

        <h3>Prescrizioni di legge</h3>
        <p>{app.name} può divulgare i vostri Dati personali in buona fede, ritenendo che tale azione sia necessaria per:</p>
        <ul>
          <li>Rispettare un obbligo legale</li>
          <li>Proteggere e difendere i diritti o la proprietà di {app.name}</li>
          <li>Prevenire o investigare possibili illeciti in relazione al Servizio</li>
          <li>Proteggere la sicurezza personale degli utenti del Servizio o del pubblico</li>
          <li>Proteggere contro la responsabilità legale</li>
        </ul>

        <h2>Sicurezza dei dati</h2>
        <p>La sicurezza dei vostri dati &egrave; importante per noi, ma ricordate che nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica &egrave; sicuro al 100%. Pertanto, anche se adotteremo ogni mezzo commercialmente accettabile per proteggere i vostri Dati personali, non possiamo garantirne la sicurezza assoluta.</p>

        <h2>Fornitori di servizi</h2>
        <p>Potremmo impiegare società e individui di terze parti per facilitare il nostro Servizio (&quot;Fornitori di servizi&quot;), per fornire il Servizio per nostro conto, per eseguire servizi relativi ai Servizi o per aiutarci ad analizzare come viene utilizzato il nostro Servizio.</p>
        <p>Le terze parti hanno accesso ai vostri Dati personali solo per eseguire queste attività per nostro conto e sono obbligate a non rivelarle o utilizzarle per altri scopi.</p>

        <h2>Link ad altri siti</h2>
        <p>Il nostro servizio può contenere collegamenti ad altri siti non gestiti da noi. Cliccando su un link di terze parti, sarete indirizzati al sito di quella terza parte. Ti consigliamo vivamente di rivedere l&apos;Informativa sulla privacy di ogni sito che visiti.</p>
        <p>Non abbiamo alcun controllo e non ci assumiamo alcuna responsabilità per il contenuto, le politiche sulla privacy o le pratiche di qualsiasi sito o servizio di terzi.</p>

        <h2>Privacy dei minori</h2>
        <p>Il nostro servizio non si rivolge a minori di 18 anni (&quot;Bambini&quot;).</p>
        <p>Non raccogliamo consapevolmente informazioni personali relative a utenti di età inferiore a 18 anni. Se siete un genitore o tutore e siete consapevoli che vostro figlio ci ha fornito Dati personali, vi preghiamo di contattarci. Se veniamo a conoscenza del fatto che abbiamo raccolto Dati personali da minori senza la verifica del consenso dei genitori, adotteremo provvedimenti per rimuovere tali informazioni dai nostri server.</p>

        <h2>Modifiche alla presente informativa sulla privacy</h2>
        <p>Potremmo aggiornare periodicamente la nostra Informativa sulla privacy. Ti informeremo di eventuali modifiche pubblicando la nuova Informativa sulla privacy in questa pagina.</p>
        <p>Vi informeremo via e-mail e / o un avviso di rilievo sul nostro Servizio, prima che la modifica diventi effettiva e aggiorneremo la &quot;data di validità&quot; nella parte superiore di questa Informativa sulla privacy.</p>
        <p>Si consiglia di rivedere periodicamente la presente Informativa sulla privacy per eventuali modifiche. Le modifiche a tale informativa sulla privacy entrano in vigore nel momento in cui vengono pubblicate su questa pagina.</p>

        <h2>Contatti</h2>
        <p>Email: <a href={`mailto:${app.privacyEmail}?subject=Biblo: Privacy`}>{app.privacyEmail}</a></p>
      </div>
    </div>
  </div>
);

export default withScrollToTop(PrivacyPage);