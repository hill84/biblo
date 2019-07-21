import React from 'react';
import { Helmet } from 'react-helmet';
import { app } from '../../config/shared';
import booksRowImage from '../../images/books-row.png';
import withScrollToTop from '../hocs/withScrollToTop';

const HelpPage = props => (
  <div id="HelpPageComponent" className="reveal fadeIn slideUp">
    <Helmet>
      <title>{app.name} | Aiuto</title>
      <meta name="description" content={app.desc} />
      <link rel="canonical" href={app.url} />
    </Helmet>
    <div className="container pad-v">
      <h1>Aiuto</h1>
      <div className="text-justify text-left-sm">
        <p>Questa pagina &egrave; in preparazione...</p>
        
        <div className="pad-v hide-sm">
          <div className="container-divider" style={{ backgroundImage: `url(${booksRowImage})` }} />
        </div>

        <p>Se hai bisogno di aiuto scrivici all'indirizzo <a href={`mailto:${app.email}?subject=Biblo: aiuto`}>{app.email}</a>.</p>
      </div>
    </div>
  </div>
);

export default withScrollToTop(HelpPage);