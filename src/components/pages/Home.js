import React from 'react';
import { Background, Parallax } from 'react-parallax';
import Link from 'react-router-dom/Link';
import { isAuthenticated, uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import { isTouchDevice } from '../../config/shared';
import heroImage from '../../images/covers-dark.jpg';
import BookCollection from '../bookCollection';
import RandomQuote from '../randomQuote';

const Home = () => (
	<div id="homeComponent">
		<Parallax
			className="hero"
			disabled={(isTouchDevice() || window.innerWidth < 768) ? true : false}
      strength={400}>
			<div className="container text-center">
				<h1 className="title reveal fadeIn slideUp">Scopriamo nuovi libri, insieme.</h1>
				<p className="subtitle reveal fadeIn slideUp">
          <big className="hide-sm">Crea la tua libreria, scrivi una recensione, scopri cosa leggono i tuoi amici.</big>
        </p>
        <div className="btns reveal fadeIn slideUp">
          {isAuthenticated() ? 
            <Link to={`/dashboard/${uid}`} className="btn primary lg">La mia libreria</Link> 
          : 
            <React.Fragment>
              <Link to="/signup" className="btn primary lg">Registrati</Link>
              <p><small>Sei già registrato? <Link to="/login">Accedi</Link></small></p>
            </React.Fragment>
          }
        </div>
			</div>
      <Background className="bg">
        <div className="overlay"></div>
        <img src={heroImage} alt="bookwall" />
      </Background>
		</Parallax>

		<div className="container" style={{ marginTop: '-56px' }}>
			<div className="card dark card-fullwidth-sm">
				<BookCollection cid="Harry Potter" pagination={false} limit={7} scrollable={true} />
			</div>

      <RandomQuote className="card dark quote-container" />

			<div className="card dark">
				<ul>
          <li><Link to="/admin">Admin</Link></li>
					<li><Link to="/login">{icon.loginVariant()} Login</Link></li>
					<li><Link to="/signup">{icon.accountPlus()} Signup</Link></li>
					<li><Link to="/password-reset">{icon.lockReset()} Reset password</Link></li>
					<li><Link to={`/dashboard/${uid}`}>{icon.dashboard()} Dashboard</Link></li>
					<li><Link to="/books/add">{icon.plusCircle()} Add book</Link></li>
					<li><Link to="/new-book">{icon.newBox()} New book</Link></li>
					<li><Link to="/profile">{icon.accountCircle()} Profile</Link></li>
					<li><Link to="/error404">{icon.reader()} No match</Link></li>
				</ul>
			</div>
		</div>
	</div>
);

export default Home;