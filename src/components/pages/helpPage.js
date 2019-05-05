import React from 'react';
import { Helmet } from 'react-helmet';
import { app } from '../../config/shared';

const HelpPage = props => (
  <div id="HelpPageComponent" className="reveal fadeIn slideUp">
    <Helmet>
      <title>{app.name} | Aiuto</title>
      <meta name="description" content={app.desc} />
    </Helmet>
    <div className="container pad-v">
      <h1>Aiuto</h1>
      <div className="text-justify text-left-sm">
        <p>Questa pagina è in preparazione...</p>
        <br/>
        <p>Se hai bisogno di aiuto scrivici all'indirizzo <a href={`mailto:${app.email}?subject=Biblo: aiuto`}>{app.email}</a>.</p>
      </div>
    </div>
  </div>
);

export default HelpPage;