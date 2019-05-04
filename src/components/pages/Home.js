import React from 'react';
import { Helmet } from 'react-helmet';
import { InView } from 'react-intersection-observer';
import { Background, Parallax } from 'react-parallax';
import { Link, Redirect } from 'react-router-dom';
import { auth, authid, isAuthenticated } from '../../config/firebase';
import { appDesc, appName, isTouchDevice, needsEmailVerification, screenSize } from '../../config/shared';
import heroImage from '../../images/covers-dark.jpg';
import Authors from '../authors';
import BookCollection from '../bookCollection';
import Genres from '../genres';
import RandomQuote from '../randomQuote';
import Reviews from '../reviews';

const seo = {
  title: `${appName} | Home`,
  description: appDesc
}

class Home extends React.Component {
  state = {
    redirectTo: null,
    screenSize: screenSize()
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
            <h1 className="title reveal fadeIn slideUp">scopriamo nuovi libri, insieme</h1>
            <p className="subtitle reveal fadeIn slideUp">
              <big className="hide-sm">Crea la tua libreria, scrivi una recensione, scopri cosa leggono i tuoi amici</big>
            </p>
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
            <img src={heroImage} alt="bookwall" />
          </Background>
        </Parallax>
    
        <div className="container" style={{ marginTop: '-56px' }}>
          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Best seller" pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>
    
          <div className="row flex">
            <div className="col-12 col-lg-5 flex">
              <div className="card dark card-fullwidth-sm">
                <h2>Citazione</h2>
                <RandomQuote className="quote-container" />
              </div>
            </div>
            <div className="col-12 col-lg-7 flex">
              <div className="card dark card-fullwidth-sm">
                <h2>Generi</h2>
                <Genres scrollable={isScrollable} />
              </div>
            </div>
          </div>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Libri proibiti" pagination={false} limit={7} inView={inView} scrollable />
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
                <BookCollection cid="Premio Strega" pagination={false} limit={7} inView={inView} desc scrollable />
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
                <BookCollection cid="Harry Potter" pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>

          <InView triggerOnce rootMargin={rootMargin}>
            {({ inView, ref }) => 
              <div className="card dark card-fullwidth-sm" ref={ref}>
                <BookCollection cid="Top" pagination={false} limit={7} inView={inView} scrollable />
              </div>
            }
          </InView>
        </div>
      </div>
    );
  }
}
 
export default Home;