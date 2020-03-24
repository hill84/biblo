import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Zoom from 'react-medium-image-zoom';
import { Link } from 'react-router-dom';
import { authorFollowersRef, authorRef, booksRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, denormURL, getInitials, handleFirestoreError, normalizeString, normURL } from '../../config/shared';
import { historyType, locationType, matchType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/authorPage.css';
import Cover from '../cover';
import MinifiableText from '../minifiableText';
import NoMatch from '../noMatch';
import RandomQuote from '../randomQuote';
import Bubbles from './bubbles';

const unsub = {
  authorFollowersFetch : null
};

const AuthorPage = props => {
  const { isAuth, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { history, location, match } = props;
  const [author, setAuthor] = useState({
    bio: '',
    displayName: denormURL(match.params.aid) || '',
    edit: null,
    languages: [],
    lastEditBy: '',
    lastEditByUid: '',
    lastEdit_num: 0,
    photoURL: '',
    sex: '',
    source: ''
  });
  const [books, setBooks] = useState(null);
  const [coverview, setCoverview] = useState(true);
  const [follow, setFollow] = useState(false);
  const [followers, setFollowers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const is = useRef(true);
  
  const fetchFollowers = useCallback(() => {
    const { aid } = match.params;
    
    if (user) {
      const id = decodeURI(aid.replace(/_/g, '-')).toLowerCase();
      unsub.authorFollowersFetch = authorFollowersRef(id).onSnapshot(snap => {
        if (!snap.empty) {
          const followers = [];
          snap.forEach(follower => followers.push(follower.data()));
          setFollowers(followers); 
          setFollow(user && followers.filter(follower => follower.uid === user.uid).length > 0);
        } else {
          setFollowers(null);
          setFollow(false);
        }
      });
    }
  }, [match.params, user]);

  useEffect(() => {
		authorRef(normalizeString(author.displayName)).get().then(snap => {
      if (snap.exists) {
        if (is.current) {
          setAuthor(snap.data());
          setLoading(false);
          fetchFollowers();
        }
			} else {
        if (is.current) setLoading(false);
        fetchFollowers();
      }
    }).catch(err => console.warn(err));
  }, [author.displayName, fetchFollowers]);

  useEffect(() => {
    booksRef.where(`authors.${author.displayName}`, '==', true).get().then(snap => {
      if (!snap.empty) {
        const books = [];
        snap.forEach(book => books.push(book.data()));
        // console.log(books);
        if (is.current) {
          setBooks(books);
          setLoadingBooks(false);
        }
      } else if (is.current) {
        setBooks(null);
        setLoadingBooks(false);
      }
    }).catch(err => console.warn(err));
  }, [author.displayName]);

  useEffect(() => () => {
    is.current = false;
    unsub.authorFollowersFetch && unsub.authorFollowersFetch();
  }, []);

  const onFollow = () => {
    const { aid } = match.params;
    const id = decodeURI(aid.replace(/_/g, '-')).toLowerCase();

    if (follow) {
      // console.log('unfollow', aid);
      authorFollowersRef(id).doc(user.uid).delete().then(() => setFollow(false)).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    } else {
      // console.log('follow', aid);
      authorFollowersRef(id).doc(user.uid).set({
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: Date.now()
      }).then(() => setFollow(true)).catch(err => openSnackbar(handleFirestoreError(err), 'error'));
    }
  };

  const onToggleView = () => setCoverview(!coverview);

  const covers = books?.map(book => <Link key={book.bid} to={`/book/${book.bid}/${normURL(book.title)}`}><Cover book={book} /></Link>);

  if (loading) {
    return <div aria-hidden="true" className="loader"><CircularProgress /></div>
  } 
  if (!author.lastEditByUid && !books) {
    return <NoMatch title="Autore non trovato" history={history} location={location} />
  }

  const seo = author?.displayName && {
    description: `Scopri su ${app.name} i libri di ${author.displayName}`,
    image: author.photoURL,
    title: `${app.name} | ${author.displayName}`,
    url: `${app.url}/author/${normURL(author.displayName)}`,
  };

  return (
    <div className="container" id="authorComponent" ref={is}>
      <Helmet>
        <title>{seo.title || `${app.name} | Autore`}</title>
        <link rel="canonical" href={`${app.url}/authors`} />
        <meta name="description" content={seo.description} />
        <meta property="og:type" content="books.author" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:url" content={seo.url} />
        <meta property="og:description" content={seo.description} />
        {seo.image && <meta property="og:image" content={seo.image} />}
      </Helmet>
      <div className="card dark author">
        <div className="row text-center-md">
          <div className="col-md-auto col-sm-12">
            <Avatar className="avatar centered">
              {author.photoURL ? (
                <Zoom overlayBgColorEnd="rgba(var(--canvasClr), .8)" zoomMargin={10}>
                  <img alt={author.displayName} src={author.photoURL} className="avatar thumb" />
                </Zoom>
              ) : getInitials(author.displayName)}
            </Avatar>
          </div>
          <div className="col">
            <div className="row">
              <div className="col">
                <h2 className="title">{author.displayName}</h2>
              </div>
              <div className="col-auto text-right hide-md">
                <Link to="/authors" className="btn sm primary">Autori</Link>
              </div>
            </div>
            <div className="info-row bio text-left">
              <MinifiableText text={author.bio} source={author.source} maxChars={500} />
            </div>

            {isAuth && (
              <div className="info-row">
                <button 
                  type="button" 
                  className={`btn sm ${follow ? 'success error-on-hover' : 'primary'}`} 
                  onClick={onFollow} 
                  disabled={!user || !isEditor}>
                  {follow ? (
                    <>
                      <span className="hide-on-hover">{icon.check} Segui</span>
                      <span className="show-on-hover">Smetti</span>
                    </> 
                  ) : <span>{icon.plus} Segui</span> }
                </button>
                <div className="counter last inline">
                  <Bubbles limit={3} items={followers} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {loadingBooks ? (
        <div aria-hidden="true" className="loader relative"><CircularProgress /></div>
      ) : (
        <>
          {books ? (
            <div className="card light">
              <div className="shelf">
                <div className="collection hoverable-items">
                  <div className="head nav">
                    <div className="row">
                      <div className="col">
                        <button 
                          type="button"
                          className="btn sm flat counter"
                          title={coverview ? 'Stack view' : 'Cover view'} 
                          onClick={onToggleView}>
                          {coverview ? icon.viewSequential : icon.viewGrid}
                        </button>
                        <span className="counter">{books.length || 0} libr{books.length === 1 ? 'o' : 'i'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`shelf-row books-per-row-4 ${coverview ? 'coverview' : 'stacked'}`}>
                    {covers}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="info-row empty text-center pad-sm">
              <p>Non ci sono ancora libri di {author.displayName}</p>
              <Link to="/new-book" className="btn primary rounded">Aggiungi libro</Link>
            </div>
          )}
        </>
      )}
      <RandomQuote author={author.displayName} skeleton={false} className="card flat fadeIn slideUp reveal" />
    </div>
  );
}

AuthorPage.propTypes = {
  history: historyType,
  location: locationType,
  match: matchType
}

AuthorPage.defaultProps = {
  history: null,
  location: null,
  match: null
}

export default AuthorPage;