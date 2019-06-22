import React from 'react';
import { Helmet } from 'react-helmet';
import { InView } from 'react-intersection-observer';
import { Background, Parallax } from 'react-parallax';
import { Link, Redirect } from 'react-router-dom';
import { auth, authid, isAuthenticated } from '../../config/firebase';
import { app, isTouchDevice, needsEmailVerification, screenSize } from '../../config/shared';
import bgHerojpg from '../../images/covers-dark.jpg';
import bgHerowebp from '../../images/covers-dark.webp';
import Authors from '../authors';
import BookCollection from '../bookCollection';
import Genres from '../genres';
import RandomQuote from '../randomQuote';
import Reviews from '../reviews';
import { funcType } from '../../config/types';

const seo = {
  title: `${app.name} | Home`,
  description: app.desc
}

class Home extends React.Component {
  state = {
    redirectTo: null,
    screenSize: screenSize()
  }

  static propTypes = {
    openSnackbar: funcType.isRequired
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('resize', this.updateScreenSize);

		auth.onIdTokenChanged(user => {
      if (needsEmailVerification(user)) {
        if (this._isMounted) {
          this.setState({ redirectTo: '/verify-email' });
        }
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener('resize', this.updateScreenSize);
  }

  updateScreenSize = () => this._isMounted && this.setState({ screenSize: screenSize() });
  
  render() { 
    const { redirectTo, screenSize } = this.state;
    const { openSnackbar } = this.props;
    const isScrollable = isTouchDevice() || screenSize === 'sm' || screenSize === 'xs';
    const rootMargin = '200px';

    if (redirectTo) return <Redirect to={redirectTo} />

    return (
      <div id="homeComponent">
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
        </Helmet>
        <Parallax
          className="hero"
          disabled={isScrollable}
          strength={400}>
          <div className="container text-center">
            <h1 className="title reveal fadeIn slideUp">Scopriamo nuovi libri, insieme</h1>
            <p className="subtitle reveal fadeIn slideUp hide-sm">Crea la tua libreria, scrivi una recensione, scopri cosa leggono i tuoi amici</p>
            <div className="btns reveal fadeIn slideUp">
              {isAuthenticated() ? 
                <React.Fragment>
                  <Link to={`/dashboard/${authid}`} className="btn primary lg rounded">La mia libreria</Link> 
                  <p className="font-sm">
                    <Link className="counter" to="/about">Chi siamo</Link>
                    <Link className="counter" to="/help">Aiuto</Link>
                    <Link className="counter last" to="/donations">Donazioni</Link>
                  </p>
                </React.Fragment>
              : 
                <React.Fragment>
                  <Link to="/signup" className="btn primary lg rounded">Registrati</Link>
                  <p><small>Sei già registrato? <Link to="/login">Accedi</Link></small></p>
                </React.Fragment>
              }
            </div>
          </div>
          <Background className="bg reveal fadeIn">
            <div className="overlay" />
            <picture>
              <source srcSet={bgHerowebp} type="image/webp" />
              <source srcSet={bgHerojpg} type="image/jpeg" /> 
              <img src={bgHerojpg} alt="Biblo, condividi la tua passione per i libri e per la lettura" />
            </picture>
          </Background>
        </Parallax>
    
        <div className="container" style={{ marginTop: -56 }}>
          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref} style={{ marginBottom: 0 }}>
                <BookCollection cid="Best seller" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>

          <div className="row text-center" style={{ marginBottom: 14 }}>
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
                    <button className="btn sm flat counter">
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
                <BookCollection cid="Libri proibiti" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>
    
          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div ref={ref}>
                {inView && <Reviews limit={4} pagination={false} skeleton />}
              </div>
            }
          </InView>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Premio Strega" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} desc scrollable />
              </div>
            }
          </InView>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <Authors pagination={false} limit={9} inView={inView} scrollable />
              </div>
            }
          </InView>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Harry Potter" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Top" openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>

          <div className="card flat col-md-6 text-center">
            <p className="text-xl">Siamo anche su Facebook</p>
            <div><a className="btn facebook rounded" href={app.fb.url} target="_blank" rel="noopener noreferrer">Segui {app.fb.name}</a></div>
          </div>
        </div>
      </div>
    );
  }
}
 
export default Home;