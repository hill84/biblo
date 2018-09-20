import React from 'react';
import { appName } from '../../config/shared';

const AboutPage = props => (
    <div id="AboutPageComponent" className="reveal fadeIn slideUp">
      <div className="container pad-v">
        <h2>Chi siamo</h2>
        <div className="text-justify text-left-sm">
          <p><big>{appName} è un social network dedicato a chi ama i libri e la lettura.</big></p>
          <p>{appName} è la più ricca fonte di informazione sui libri in Italia e la più indipendente. Iscrivendoti e consultando {appName} potrai trovare informazioni utili e interessanti su milioni di libri, scambiare opinioni con altri lettori, vedere cosa pensano gli utenti, leggendo le loro recensioni e i loro giudizi. Su {appName} trovi le recensioni e i voti dati ai libri da altri utenti come te, tutti rigorosamente neutrali. Su {appName} puoi anche organizzare la tua libreria e tenere traccia delle tue letture. Inoltre, se lo desideri, puoi scambiare i tuoi libri con altri utenti.</p>
          <p>Su {appName} puoi: costruire e aggiornare il tuo profilo e vedere quello degli altri utenti; creare la tua libreria e la tua lista dei desideri (la <em>wishlist</em>); catalogare, recensire e votare i libri che leggi; alimentare e vedere le tue statistiche di lettura; consultare le librerie di altri utenti e seguirli; insomma partecipare alla vita della community e contribuire ad arricchirla di contenuti, idee e iniziative.</p>
          <p>Tutti i contenuti di {appName} sono consultabili anche senza essere iscritti a {appName}. La registrazione è necessaria per costruire la propria libreria, scrivere una recensione o partecipare a una discussione. Le uniche informazioni obbligatorie per l’apertura dell’account sono lindirizzo email e il nominativo. Tutte le altre informazioni sono facoltative, anche se ovviamente utili per fornire un servizio migliore.</p>
          <p>Se anche tu ami i libri, insomma, {appName} è casa tua.</p>
        </div>
      </div>
    </div>
  );

export default AboutPage;