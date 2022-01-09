import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import BooksRowDivider from '../booksRowDivider';
import withScrollToTop from '../hocs/withScrollToTop';

const AboutPage: FC = () => (
  <div id='AboutPageComponent' className='reveal fadeIn slideUp'>
    <Helmet>
      <title>{app.name} | Chi siamo</title>
      <link rel='canonical' href={app.url} />
    </Helmet>
    <div className='container pad-v'>
      <h1>Chi siamo</h1>
      <div className='text-justify text-left-sm'>
        <p className='accent-text'><big>{app.name} &egrave; un social network dedicato a chi ama i libri e la lettura.</big></p>
        <p>La nostra missione &egrave; aiutare i lettori a trovare e condividere i libri che amano, diffondendo la passione per la lettura e la letteratura.</p>
        
        <BooksRowDivider />

        <h2>Alcune cose che puoi fare su {app.name}</h2>
        <p>Iscrivendoti e consultando {app.name} potrai trovare informazioni utili e interessanti su tantissimi libri, scambiare opinioni con altri lettori e vedere cosa pensano gli utenti, leggendo le loro recensioni e i loro giudizi. Su {app.name} trovi le recensioni e i voti dati ai libri da altri utenti come te. Inoltre, se vuoi, puoi anche organizzare la tua libreria e tenere traccia delle tue letture, annotando lo stato di lettura e tante altre informazioni.</p>
        <p>Su {app.name} puoi costruire e aggiornare il tuo profilo e vedere quello degli altri utenti, creare la tua libreria e la tua lista dei desideri, catalogare, recensire e votare i libri che leggi, consultare le librerie di altri utenti e seguirli. Insomma su {app.name} puoi partecipare alla vita della community e contribuire ad arricchirla di contenuti, idee e iniziative.</p>
        <p><big>Se anche tu ami i libri, insomma, {app.name} &egrave; casa tua.</big></p>
        <br />

        <h2>Alcune considerazioni sul progetto</h2>
        <p>{app.name} &egrave; {/* un progetto personale di <a href='http://www.giuseppegerbino.com' target='_blank' rel='noopener noreferrer'>Giuseppe Gerbino</a>, nato dalla sua passione per i libri e sviluppato nel tempo libero, autofinaziandosi. Il progetto &egrave; */} attualmente in fase &quot;beta&quot;, cio&egrave; aperto al pubblico ma ancora in una versione non definitiva: in questa fase il contributo degli utenti &egrave; indispensabile per testare l&apos;applicazione, trovare e segnalare malfunzionamenti e bug e fornire commenti o pareri per migliorare l&apos;esperienza utente. Se quindi {app.name} ti piace e vuoi partecipare alla sua crescita puoi inviare i tuoi messaggi all&apos;indirizzo <a href={`mailto:${app.email}?subject=Biblo: commento utente`}>{app.email}</a> o contribuire con una <Link to='/donations'>donazione</Link> (bastano pochi euro).</p>
      </div>
    </div>
  </div>
);

export default withScrollToTop(AboutPage);