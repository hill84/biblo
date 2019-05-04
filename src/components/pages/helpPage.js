import React from 'react';
import { Helmet } from 'react-helmet';
import { appDesc, appEmail, appName } from '../../config/shared';

const HelpPage = props => (
  <div id="HelpPageComponent" className="reveal fadeIn slideUp">
    <Helmet>
      <title>{appName} | Aiuto</title>
      <meta name="description" content={appDesc} />
    </Helmet>
    <div className="container pad-v">
      <h1>Aiuto</h1>
      <div className="text-justify text-left-sm">
        <p>Questa pagina è in preparazione...</p>
        <br/>
        <p>Se hai bisogno di aiuto scrivici all'indirizzo <a href={`mailto:${appEmail}?subject=Biblo: aiuto`}>{appEmail}</a>.</p>
      </div>
    </div>
  </div>
);

export default HelpPage;