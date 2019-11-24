import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { InView } from 'react-intersection-observer';
import { Link, Redirect } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { app, isTouchDevice, needsEmailVerification, screenSize } from '../../config/shared';
import { funcType, userType } from '../../config/types';
import bgHerojpeg from '../../images/covers-dark.jpg';
import Authors from '../authors';
import BookCollection from '../bookCollection';
import DonationButtons from '../donationButtons';
import Genres from '../genres';
import withScrollToTop from '../hocs/withScrollToTop';
import RandomQuote from '../randomQuote';
import Reviews from '../reviews';
import '../../css/home.css';

const seo = {
  title: `${app.name} | Home`,
  description: app.desc
}

const Home = props => {
  const [redirectTo, setRedirectTo] = useState(null);
  const [screensize, setScreensize] = useState(screenSize());
  
  const is = useRef(true);
  const { openSnackbar, user } = props;

  useEffect(() => {
    const updateScreenSize = () => {
      if (is.current) setScreensize(screenSize());
    }

    window.addEventListener('resize', updateScreenSize);

    auth.onIdTokenChanged(user => {
      if (needsEmailVerification(user)) {
        if (is.current) setRedirectTo('/verify-email');
      }
    });

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      is.current = false;
    };
  }, []);
  
  if (redirectTo) return <Redirect to={redirectTo} />

  const isScrollable = isTouchDevice() || screensize === 'sm' || screensize === 'xs';
  const rootMargin = '200px';
  const Hero = (
    <div className="container text-center">
      <h1 className="title">Condividi la tua passione per i libri</h1>
      <p className="subtitle">Crea la tua libreria, ascolta gli incipit, scopri cosa leggono i tuoi amici</p>
      <div className="btns">
        <Link to={user ? `/dashboard/${user.uid}` : '/signup'} className="btn primary lg rounded">{user ? 'La mia libreria' : 'Registrati'}</Link> 
        <div>
          {user ?
            <>
              <Link className="counter" to="/about">Chi siamo</Link>
              <Link className="counter" to="/help">Aiuto</Link>
              <Link className="counter last" to="/donations">Donazioni</Link>
            </>
          : <p className="counter last">Sei già registrato? <Link to="/login">Accedi</Link></p>}
        </div>
      </div>
    </div>
  );

  return (
    <div id="homeComponent" ref={is}>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="hero" style={{ backgroundImage: `url(${bgHerojpeg})` }}>
        <div className="overlay" />
        {Hero}
      </div>
  
      <div className="container" style={{ marginTop: -56, }}>
        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref} style={{ marginBottom: 0, }}>
              <BookCollection cid="Best seller" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
            </div>
          }
        </InView>

        <div className="row text-center" style={{ marginBottom: 14, }}>
          <div className="col-md col-sm-6 pad">
            <h3>Crea la tua libreria</h3>
            <p>Riempi la tua dashboard con i libri che hai letto o che vorresti leggere</p>
          </div>
          <div className="col-md col-sm-6 pad">
            <h3>Scrivi le tue recensioni</h3>
            <p>Condividi con gli altri lettori le tue opinioni sui libri che hai letto</p>
          </div>
          <div className="col-md col-sm-6 pad">
            <h3>Entra nella community</h3>
            <p>Conosci lettori con i tuoi stessi gusti e scopri cosa stanno leggendo</p>
          </div>
          <div className="col-md col-sm-6 pad">
            <h3>Scopri nuovi libri</h3>
            <p>Sfoglia il catalogo per scoprire il tuo prossimo libro preferito</p>
          </div>
        </div>
  
        <div className="row flex">
          <div className="col-12 col-lg-5 flex">
            <div className="card dark card-fullwidth-sm">
              <h2>Citazione</h2>
              <RandomQuote className="quote-container" />
            </div>
          </div>
          <div className="col-12 col-lg-7 flex">
            <div className="card dark card-fullwidth-sm">
              <div className="head nav">
                <span className="counter last title">Generi</span>
                <div className="pull-right">
                  <button type="button" className="btn sm flat counter">
                    <Link to="/genres">Vedi tutti</Link>
                  </button>
                </div>
              </div>
              
              <Genres className="table" scrollable={isScrollable} />
            </div>
          </div>
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref}>
              <Authors pagination={false} limit={9} inView={inView} scrollable />
            </div>
          }
        </InView>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div ref={ref}>
              {inView && <Reviews limit={5} openSnackbar={openSnackbar} pagination skeleton />}
            </div>
          }
        </InView>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref}>
              <BookCollection cid="Libri proibiti" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
            </div>
          }
        </InView>

        <div className="card flat col-11 col-md-6 text-center">
          <p className="text-xl">Biblo.space è un progetto gratuito e indipendente.<br className="hide-sm" /> Se vuoi, puoi supportarci con una donazione</p>
          <DonationButtons />
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref}>
              <BookCollection cid="Premio Strega" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} desc scrollable />
            </div>
          }
        </InView>

        {/* <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref}>
              <BookCollection cid="Harry Potter" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
            </div>
          }
        </InView> */}

        <div className="card flat col-11 col-md-6 text-center">
          <p className="text-xl">Siamo anche su Facebook e Twitter</p>
          <div>
            <a className="btn facebook rounded" href={app.fb.url} target="_blank" rel="noopener noreferrer"><span className="hide-sm">Seguici su</span> Facebook</a>
            <a className="btn twitter rounded" href={app.tw.url} target="_blank" rel="noopener noreferrer"><span className="hide-sm">Seguici su</span> Twitter</a>
          </div>
        </div>

        <InView triggerOnce rootMargin={rootMargin}>
          {({ inView, ref }) => 
            <div className="card dark card-fullwidth-sm" ref={ref}>
              <BookCollection cid="Top" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
            </div>
          }
        </InView>

      </div>
    </div>
  );
}

Home.propTypes = {
  openSnackbar: funcType.isRequired,
  user: userType,
}

Home.defaultProps = {
  user: null
}
 
export default withScrollToTop(Home);