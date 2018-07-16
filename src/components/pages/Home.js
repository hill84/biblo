import React from 'react';
import Link from 'react-router-dom/Link';
import { isAuthenticated, uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import BookCollection from '../bookCollection';
import { Parallax, Background } from 'react-parallax';
import heroImage from '../../images/covers-dark.jpg';

const Home = () => (
	<div id="homeComponent">
		<Parallax
      className="hero"
      strength={400}>
      
			<div className="container">
				<h1>Scopriamo nuovi libri, insieme</h1>
				<p>Lorem ipsum dolor sit amet</p>
				{isAuthenticated() ? 
					<Link to={`/dashboard/${uid}`} className="btn primary lg">La mia libreria</Link> 
				: 
					<Link to="/signup" className="btn primary lg">Registrati</Link>
				}
			</div>
      <Background className="bg">
        <div className="overlay"></div>
        <img src={heroImage} alt="forrest" />
      </Background>
		</Parallax>

		<div className="container" style={{ marginTop: '-56px' }}>
			<div className="card dark card-fullwidth-sm">
				<BookCollection cid="Harry Potter" pagination={false} limit={7} scrollable={true} />
			</div>

			<div className="card">
				<ul>
					<li><Link to="/login">{icon.loginVariant()} Login</Link></li>
					<li><Link to="/signup">{icon.accountPlus()} Signup</Link></li>
					<li><Link to="/password-reset">{icon.lockReset()} Reset password</Link></li>
					<li><Link to={`/dashboard/${uid}`}>{icon.dashboard()} Dashboard</Link></li>
					<li><Link to="/books/add">{icon.plusCircle()} Add book</Link></li>
					<li><Link to="/new-book">{icon.newBox()} New book</Link></li>
					<li><Link to="/profile">{icon.accountCircle()} Profile</Link></li>
					<li><Link to="/error404">No match</Link></li>
				</ul>
			</div>
		</div>
	</div>
);

export default Home;