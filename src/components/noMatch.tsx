import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { app } from '../config/shared';
import { useNavigate } from 'react-router-dom';
import RandomQuote from './randomQuote';

interface NoMatchProps {
  imgUrl?: string;
  title?: string;
}

const NoMatch: FC<NoMatchProps> = ({
  imgUrl,
  title
}: NoMatchProps) => {
  const { t } = useTranslation(['common']);

  const navigate = useNavigate();

  return (
    <div className='container empty' id='noMatchComponent'>
      <Helmet>
        <title>{app.name} | {title || t('PAGE_NOT_FOUND')}</title>
        <meta name='robots' content='noindex, nofollow' />
      </Helmet>
      <div className='card dark empty'>
        <div className='text-center'>
          <h1>{title || t('PAGE_NOT_FOUND')}</h1>
          <p>{t('PAGE_NOT_FOUND_PARAGRAPH')}{location && <span className='hide-sm'>: <big><code className='primary-text'>{location.pathname}</code></big></span>}.</p>
          {imgUrl && <img src={imgUrl} alt={t('PAGE_NOT_FOUND')} />}
          <button type='button' onClick={() => navigate(-1)} className='btn flat rounded'>
            {t('ACTION_BACK')}
          </button>
        </div>
      </div>

      <div className='card flat col-md-8'>
        <RandomQuote className='quote-container' skeleton={false} />
      </div>
    </div>
  );
};

export default NoMatch;