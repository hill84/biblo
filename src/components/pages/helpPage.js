import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import withScrollToTop from '../hocs/withScrollToTop';

const faqs = [{
  id: 1,
  q: `Che cos'è ${app.name}?`,
  a: `${app.name} è un social network gratuito e indipendente dedicato a chi ama i libri e la letteratura. Registrandoti su ${app.name} potrai trovare informazioni su migliaia di libri, scambiare opinioni con altri lettori e leggere le loro recensioni e i loro giudizi. Su ${app.name} puoi anche organizzare la tua libreria e tenere traccia dei libri letti. Ma non è tutto... Su ${app.name} puoi controllare le tue statisiche di lettura, partecipare ai gruppi di discussione e consigliare i tuoi libri preferiti agli amici.`
}, {
  id: 2,
  q: `Come e perché registrarsi su ${app.name}?`,
  a: `Tutti i contenuti di ${app.name} sono consultabili anche senza essere registrati. Se però vuoi creare la tua libreria, catalogare i libri letti, scrivere una recensione o partecipare ai gruppi di discussione, è necessaria la registrazione. Le uniche informazioni obbligatorie per la registrazione sono l'indirizzo email e il nominativo.`
}, {
  id: 3,
  q: `Come funziona la ricerca?`,
  a: `Nella barra di navigazione, in alto a destra, è presente un'icona a forma di lente d'ingrandimento. Cliccandoci ti comparirà una barra di ricerca dovre potrai inserire i termini chiave per trovare il libro che stai cercando. Puoi effettuare ricerche per titolo, autore, ISBN o editore. Il modo più efficace è usando il codice ISBN che fornisce una risposta certa e univoca. Se non trovi il libro che stai cercando, puoi creare tu stesso la scheda del libro.`
}, {
  id: 4,
  q: `Che cos'è la mia libreria?`,
  a: `Registrandoti su ${app.name} viene generata una pagina pubblica dove vengono raccolte tutte le tue informazioni. La tua libreria è accessibile cliccando sul tuo avatar (nella barra di navigazione) e poi su "la mia libreria". In alto trovi le informazioni relative al tuo profilo utente, che puoi modificare cliccando sul pulsante "modifica", in basso, invece, trovi le schede e i dati relativi alle tue attività su ${app.name}: i libri letti, la lista dei desideri, le statistiche di lettura (private), le attività e i contatti.`
}, {
  id: 5,
  q: `Cosa sono le statistiche di lettura?`,
  a: `Ogni volta che aggiungi un libro alla tua libreria puoi catalogarlo registrando alcune informazioni sullo stato di lettura. Basandosi su queste informazioni, ${app.name} genera una serie di statistiche utili per tracciare la qualità e l'andamento delle tue letture nel tempo. Per accedere alle tue statistiche di lettura entra nella tua libreria e clicca sul tab "statistiche".`
}, {
  id: 6,
  q: `Come aggiungo un libro alla mia libreria?`,
  a: `Se ti trovi nella tua libreria, puoi cliccare sul pulsante "aggiungi libro" e, attraverso la barra di ricerca, scegliere il libro che preferisci. Una volta scelto il libro, clicca sul pulsante "+ libreria" o "+ desideri". Se ti trovi su un'altra pagina, puoi cliccare direttamente sul pulsante con l'icona a forma di lente d'ingrandimento nella barra di navigazione e proseguire da lì. Una volta aggiunto il libro, puoi votarlo, aggiungere la tua recensione o aggiornarne lo stato di lettura.`
}, {
  id: 7,
  q: `Come posso aggiungere un libro non presente su ${app.name}?`,
  a: `Se il libro che vuoi aggiungere alla tua libreria non è presente su ${app.name}, puoi aggiungerlo cliccando sul pulsante con l'icona a forma di + (nella barra di navigazione). Ti comparirà una barra di ricerca dove potrai inserire il titolo, l'ISBN (13 cifre), l'autore o l'editore con cui prepopolare (grazie alle API di Google Books) la scheda del libro. Compila la scheda inserendo tutte le informazioni necessarie e clicca sul pulsante "crea scheda libro". Se la validazione dei dati inseriti andrà a buon fine, il tuo libro sarà stato aggiunto al database di ${app.name} e potrai aggiungerlo alla tua libreria`
}, {
  id: 8,
  q: `Posso aggiungere un libro sprovvisto di ISBN?`,
  a: `No, su ${app.name} si possono aggiungere solo libri forniti di codice ISBN.`
}, {
  id: 9,
  q: `Come rimuovo un libro dalla mia libreria?`,
  a: `Clicca sulla copertina del libro e poi sul pulsante "✔ libreria" (o "✔ desideri").`
}, {
  id: 10,
  q: `Che cos'è la lista dei desideri?`,
  a: `È lo spazio dove puoi aggiungere i libri che vuoi leggere in futuro.`
}, {
  id: 11,
  q: `Come posso votare un libro?`,
  a: `Aggiungi il libro alla tua libreria e clicca sulle stelline. Puoi attribuire un voto da 1 a 5 stelle.`
}, {
  id: 12,
  q: `Come posso aggiungere una recensione?`,
  a: `Aggiungi il libro alla tua liberia e clicca sul pulsante "aggiungi una recensione". È buona norma, prima di scrivere la recensione, aggiungere una foto profilo e dare un voto al libro. Quando hai finito, clicca sul pulsante "pubblica". Attenzione: la tua recensione deve fare riferimento al libro in oggetto e non violare le linee guida di ${app.name} (es: niente contenuti violenti o offensivi, spam e link esterni). Potrai modificare la tua recensione in qualunque momento cliccando sul pulsante "modifica" o cancellarla cliccando sul tasto "elimina".`
}, {
  id: 13,
  q: `Come posso migliorare le informazioni di una scheda libro che riporta dati incompleti o errati?`,
  a: `Entra nella scheda del libro e clicca sul pulsante "modifica". Aggiungi le informazioni mancanti o errate e clicca sul pulsante "salva le modifiche". L'unico dato che non puoi modificare è il codice ISBN; se i dati non corrispondono al libro devi chiedere la modifica dei dati, NON del codice.`
}, {
  id: 14,
  q: `Posso cambiare la copertina di un libro?`,
  a: `Solo gli amministrati di ${app.name} possono aggiungere o modificare la copertina dei libri. Se vuoi segnalare una copertina errata o mancante apri una segnalazione nel gruppo di assistenza.`
}, {
  id: 15,
  q: `Come posso consigliare un libro a un amico?`,
  a: `Vai sulla scheda del libro e clicca sul pulsante "consiglia". Ti comparirà una schermata dove potrai scegliere l'amico (o gli amici) a cui consigliare il libro. Se non vedi nessun amico in lista è perché non segui ancora nessun utente.`
}, {
  id: 16,
  q: `Come faccio a seguire un utente?`,
  a: `Vai sulla libreria dell'utente e clicca sul pulsante "segui". Il tuo nuovo amico verrà aggiunto alla lista dei "contatti" nella tua libreria.`
}, {
  id: 17,
  q: `Cos'è un gruppo?`,
  a: `È uno spazio in cui gli utenti di ${app.name} possono discutere liberamente di un argomento a tema letterario. Tutti gli utenti possono creare i gruppi e partecipare alle discussioni. Il creatore del gruppo ha la facoltà di modificare le informazioni relative al gruppo (es: titolo e descrizione), stabilire le regole della discussione o eliminarlo.`
}, {
  id: 18,
  q: `Posso usare ${app.name} in un'altra lingua?`,
  a: `No, al momento l'unica lingua disponibile è l'italiano.`
}, {
  id: 19,
  q: `Non trovo la mail di conferma registrazione, cosa posso fare?`,
  a: `Controlla nella cartella "spam" o nel cestino del tuo client di posta elettronica. Se non la trovi neanche lì scrivi a ${app.email}.`
}, {
  id: 20, 
  q: `Non ricordo più la password, cosa posso fare?`,
  a: `Vai alla pagina di login e clicca sul link "Non ricordi la password?", ti verrà chiesto di inserire l'email che usi per loggarti su ${app.name}. Una volta cliccato su "recupera password", dovresti ricevere un'email con un link per reimpostare la tua password.`
}, {
  id: 21,
  q: `Perchè non potete semplicemente inviarmi la password?`,
  a: `Noi non conosciamo la tua password. Per difendere la privacy, tutte le password degli utenti di ${app.name} vengono salvate usando un sistema di protezione unidirezionale crittato che ne rende impossibile la lettura a chiunque.`
}, {
  id: 22,
  q: `Che cos'è un codice ISBN?`,
  a: `L'ISBN è un codice numerico che identifica una specifica edizione di un libro. Di solito si trova sul retro del libro, sulla controcopertina o all'interno, nel colophon o nell'ultima pagina prima della controcopertina. Ogni ISBN può essere scritto in due formati: a 10 o a 13 cifre. Il formato a 13 cifre differisce dal corrispondente codice a 10 cifre perchè presenta in più il prefisso 978- e (di solito) una diversa cifra finale (es: 8854152609 e 9788854152601 identificano lo stesso libro). L'uso dell'ISBN è il modo più efficace per cercare o aggiungere un libro alla tua libreria.`
}, {
  id: 23,
  q: `Come posso sostenere ${app.name}?`,
  a: `Puoi fare una donazione volontaria. Clicca sull'hamburgher menu in altro a sinistra (☰) e poi su "donazioni". Puoi scegliere il metodo di pagamento che desideri e l'importo che ritieni più opportuno. Bastano anche pochi euro.`
}];

const HelpPage = () => {
  const [expanded, setExpanded] = useState(false);

  const onChange = panel => (e, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div id="HelpPageComponent" className="reveal fadeIn slideUp">
      <Helmet>
        <title>{app.name} | Aiuto</title>
        <meta name="description" content={app.desc} />
        <link rel="canonical" href={app.url} />
      </Helmet>
      <div className="container pad-v">
        <h1>Hai bisogno di aiuto?</h1>
        <div className="text-justify text-left-sm">
          <p>Consulta le nostre &quot;domande frequenti&quot;. Se non trovi quello che cercavi scrivici nel <Link to={app.help.group.url}>gruppo di assistenza</Link> o all&apos;indirizzo <a href={`mailto:${app.email}?subject=Biblo: aiuto`}>{app.email}</a>.</p><br />

          <h2>Domande frequenti</h2>
          <div className="accordion-container">
            {faqs.map(faq => (
              <ExpansionPanel expanded={expanded === faq.id} onChange={onChange(faq.id)} key={faq.id}>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${faq.id}bh-content`}
                  id={`${faq.id}bh-header`}>
                  <Typography><span className="light-text">{faq.id}.</span> {faq.q}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>{faq.a}</ExpansionPanelDetails>
              </ExpansionPanel>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default withScrollToTop(HelpPage);