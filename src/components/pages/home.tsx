import React, { CSSProperties, FC, Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import { Link, Redirect } from 'react-router-dom';
import { app, isTouchDevice, screenSize as _screenSize } from '../../config/shared';
import UserContext from '../../context/userContext';
import '../../css/home.css';
import bgHero_jpg from '../../images/covers-dark.jpg';
import bgHero_webp from '../../images/covers-dark.webp';
import { ScreenSizeType } from '../../types';
import Authors from '../authors';
import BookCollection from '../bookCollection';
import DonationButtons from '../donationButtons';
import Genres from '../genres';
import withScrollToTop from '../hocs/withScrollToTop';
import RandomQuote from '../randomQuote';
import Reviews from '../reviews';

interface SeoModel {
  title: string;
  description: string;
}

const seo: SeoModel = {
  title: `${app.name} | Home`,
  description: app.desc
};

const heroStyle: CSSProperties = { backgroundImage: `url(${bgHero_webp}), url(${bgHero_jpg})`, };
const rootMargin = '250px';

const Home: FC = () => {
  const { emailVerified, user } = useContext(UserContext);
  const [redirectTo, setRedirectTo] = useState<string>('');
  const [screenSize, setScreenSize] = useState<ScreenSizeType>(_screenSize());

  const { t } = useTranslation(['common']);

  useEffect(() => {
    const updateScreenSize = (): void => setScreenSize(_screenSize());

    window.addEventListener('resize', updateScreenSize);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  useEffect(() => {
    if (user && !emailVerified) {
      setRedirectTo('/verify-email');
    }
  }, [emailVerified, user]);

  const isMini = useMemo((): boolean => isTouchDevice() || ['md', 'sm', 'xs'].some((s: string): boolean => s === screenSize), [screenSize]);

  const Hero: FC = () => (
    <div className='container text-center'>
      <h1 className='title'>{t('HOME_HERO_TITLE')}</h1>
      <p className='subtitle'>{t('HOME_HERO_SUBTITLE')}</p>
      <div className='btns'>
        <Link to={user ? `/dashboard/${user.uid}` : '/signup'} className='btn primary lg rounded'>
          {t(user ? 'PAGE_DASHBOARD' : 'PAGE_SIGNUP')}
        </Link>
        <div>
          {user ? (
            <Fragment>
              <Link className='counter' to='/about'>{t('PAGE_ABOUT')}</Link>
              <Link className='counter' to='/help'>{t('PAGE_HELP')}</Link>
              <Link className='counter last' to='/donations'>{t('PAGE_DONATIONS')}</Link>
            </Fragment>
          ) : <p className='counter last'>{t('ARE_YOU_ALREADY_REGISTERED')} <Link to='/login'>{t('PAGE_LOGIN')}</Link></p>}
        </div>
      </div>
    </div>
  );

  if (redirectTo) return (
    <Redirect to={redirectTo} />
  );

  return (
    <div id='homeComponent'>
      <Helmet>
        <title>{seo.title}</title>
        <meta name='description' content={seo.description} />
      </Helmet>

      <div className='hero' style={heroStyle}>
        <div className='overlay' />
        <Hero />
      </div>

      <div className='container'>
        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <BookCollection cid='New' pagination={false} limit={7} inView={inView} rating={false} scrollable />
            </div>
          )}
        </InView>

        <div className='row text-center value-props'>
          <div className='col-md col-sm-6 pad'>
            <h3>{t('HOME_VALUE_1_TITLE')}</h3>
            <p>{t('HOME_VALUE_1_PARAGRAPH')}</p>
          </div>
          <div className='col-md col-sm-6 pad'>
            <h3>{t('HOME_VALUE_2_TITLE')}</h3>
            <p>{t('HOME_VALUE_2_PARAGRAPH')}</p>
          </div>
          <div className='col-md col-sm-6 pad'>
            <h3>{t('HOME_VALUE_3_TITLE')}</h3>
            <p>{t('HOME_VALUE_3_PARAGRAPH')}</p>
          </div>
          <div className='col-md col-sm-6 pad'>
            <h3>{t('HOME_VALUE_4_TITLE')}</h3>
            <p>{t('HOME_VALUE_4_PARAGRAPH')}</p>
          </div>
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <Authors pagination={false} limit={9} inView={inView} scrollable />
            </div>
          )}
        </InView>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div ref={ref}>
              {inView && <Reviews limit={5} pagination skeleton />}
            </div>
          )}
        </InView>
        
        <div className='row flex'>
          <div className='col-12 col-lg-5 flex'>
            <div className='card dark card-fullwidth-sm'>
              <h2>{t('QUOTE')}</h2>
              <RandomQuote className='quote-container' />
            </div>
          </div>
          <div className='col-12 col-lg-7 flex'>
            <div className='card dark card-fullwidth-sm'>
              <div className='head nav'>
                <span className='counter last title'>{t('PAGE_GENRES')}</span>
                <div className='pull-right'>
                  <button type='button' className='btn sm flat counter'>
                    <Link to='/genres'>{t('ACTION_SHOW_ALL')}</Link>
                  </button>
                </div>
              </div>

              <Genres className='table' scrollable={isMini} />
            </div>
          </div>
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <BookCollection cid='Libri proibiti' label={t('COLLECTION_FORBIDDEN_BOOKS')} pagination={false} limit={7} inView={inView} scrollable />
            </div>
          )}
        </InView>

        <div className='card flat col-11 col-md-6 text-center'>
          <p className='text-xl'>
            {t('HOME_DONATIONS_PARAGRAPH_1')}<br className='hide-sm' /> {t('HOME_DONATIONS_PARAGRAPH_2')}
          </p>
          <DonationButtons />
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <BookCollection cid='Premio Strega' label={t('COLLECTION_STREGA_AWARD')} pagination={false} limit={7} inView={inView} desc scrollable />
            </div>
          )}
        </InView>

        {/* <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => ( 
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <BookCollection cid='Harry Potter' pagination={false} limit={7} inView={inView} scrollable />
            </div>
          )}
        </InView> */}

        <div className='card flat col-11 col-md-6 text-center'>
          <p className='text-xl'>{t('HOME_SOCIAL_PARAGRAPH_1')}</p>
          <div>
            <a className='btn facebook rounded' href={app.fb.url} target='_blank' rel='noopener noreferrer'>
              Facebook
            </a>
            <a className='btn twitter rounded' href={app.tw.url} target='_blank' rel='noopener noreferrer'>
              Twitter
            </a>
          </div>
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => (
            <div className='card dark card-fullwidth-sm' ref={ref}>
              <BookCollection cid='Top' pagination={false} limit={7} inView={inView} scrollable />
            </div>
          )}
        </InView>

      </div>
    </div>
  );
};

export default withScrollToTop(Home);