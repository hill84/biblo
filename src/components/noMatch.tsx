import React, { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { app } from '../config/shared';
import { HistoryType, LocationType } from '../types';
import RandomQuote from './randomQuote';

interface NoMatchProps {
  history: HistoryType;
  imgUrl?: string;
  location?: LocationType;
  title?: string;
}

const NoMatch: FC<NoMatchProps> = ({
  history,
  imgUrl,
  location,
  title
}: NoMatchProps) => (
  <div className='container empty' id='noMatchComponent'>
    <Helmet>
      <title>{app.name} | {title || 'Pagina non trovata'}</title>
      <meta name='robots' content='noindex, nofollow' />
    </Helmet>
    <div className='card dark empty'>
      <div className='text-center'>
        <h1>{title || 'Pagina non trovata'}</h1>
        <p>Controlla di aver digitato correttamente l&apos;indirizzo{location && <span className='hide-sm'>: <big><code className='primary-text'>{location.pathname}</code></big></span>}.</p>
        {imgUrl && <img src={imgUrl} alt='Pagina non trovata' />}
        <button type='button' onClick={() => history.goBack()} className='btn flat rounded'>Torna indietro</button>
      </div>
    </div>

    <div className='card flat col-md-8'>
      <RandomQuote className='quote-container' skeleton={false} />
    </div>
  </div>
);
 
export default NoMatch;