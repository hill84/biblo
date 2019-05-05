import React from 'react';
import { Helmet } from 'react-helmet';
import { app } from '../../config/shared';

const CookiePage = props => (
  <div id="CookiePageComponent" className="reveal fadeIn slideUp">
    <Helmet>
      <title>{app.name} | Cookie policy</title>
      <meta name="description" content={app.desc} />
    </Helmet>
    <div className="container pad-v">
      <h1>Cookie policy</h1>
      <p className="lighter-text">Data di entrata in vigore: 10 Marzo 2019</p>
      <p>&nbsp;</p>
      <div className="text-justify text-left-sm">
        <p>{app.name} utilizza cookie e tecnologie di tracciamento simili per tracciare l'attività e conservare determinate informazioni.</p>
        <p>I cookie sono file con una piccola quantità di dati che possono includere un identificatore univoco anonimo. I cookie vengono inviati al vostro browser da un sito web e memorizzati sul vostro dispositivo. Altre tecnologie di tracciamento che potrebbero essere utilizzate sono anche beacon, tag e script per raccogliere e tenere traccia delle informazioni e per migliorare e analizzare il nostro Servizio.</p>
        <p>Potete chiedere al vostro browser di rifiutare tutti i cookie o di indicare quando viene inviato un cookie. Tuttavia, se non si accettano i cookie, potrebbe non essere possibile utilizzare alcune parti del nostro Servizio.</p>
        <p>Esempi di cookie che utilizziamo:</p>
        <ul>
          <li><span className="accent-text">Cookie di sessione.</span> Utilizziamo i cookie di sessione per gestire il nostro servizio.</li>
          <li><span className="accent-text">Cookie di preferenza.</span> Utilizziamo i cookie di preferenza per ricordare le vostre preferenze e varie impostazioni.</li>
          <li><span className="accent-text">Cookie di sicurezza.</span> Utilizziamo i cookie di sicurezza per motivi di sicurezza.</li>
        </ul>
      </div>
    </div>
  </div>
);

export default CookiePage;