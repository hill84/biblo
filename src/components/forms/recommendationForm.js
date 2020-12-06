import Avatar from '@material-ui/core/Avatar';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { followingsRef, notesRef, userRecommendationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, diffDates, getInitials, handleFirestoreError, normURL, truncateString } from '../../config/shared';
import { bookType, funcType } from '../../config/proptypes';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/recommendationForm.css';
import Overlay from '../overlay';
import { skltn_avatarRow } from '../skeletons';

const skltnLimit = 3;
const quoteLimit = 5;

const RecommendationForm = ({ book, onToggle }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { uid, displayName, photoURL } = user;
  const quoteInitialState = {
    uid,
    displayName,
    photoURL,
    amount: 5,
    timestamp: Date.now(),
    recommends: []
  };
  const [quote, setQuote] = useState(quoteInitialState);
  const [loading, setLoading] = useState(false);
  const [followings, setFollowings] = useState(null);
  const is = useRef(true);
  
  const count = quote?.recommends ? quote?.recommends.length : 0;

  const initQuote = useCallback(() => setQuote({ amount: 5, timestamp: Date.now(), recommends: [] }), [setQuote]);
  
  const fetch = useCallback(() => {
    setLoading(true);
    
    const unsubFetch = userRecommendationsRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        setQuote(snap.data());
        setLoading(false);
      }
    }, err => console.warn(err));
    
    return () => {
      unsubFetch && unsubFetch();
    }
	}, [uid]);
  
  useEffect(() => {
    fetch();
  }, [fetch]);
  
  const isNewDay = diffDates(24, new Date(quote.timestamp)) > 0;
  
  useEffect(() => {
    if (!quote.timestamp || isNewDay) {
      initQuote();
    } else if (quote.amount > quoteLimit || count >= quoteLimit) {
      // Shallow fix frauds
      userRecommendationsRef(uid).set({
        ...quote,
        uid,
        displayName,
        photoURL,
        amount: 0,
        timestamp: Date.now()
      }).catch(err => {
        openSnackbar(handleFirestoreError(err), 'error');
      });
    }
  }, [count, displayName, initQuote, isNewDay, openSnackbar, photoURL, quote, uid]);

  const fetchFollowings = useCallback(() => {
    setLoading(true);

    const unsubFetchFollowings = followingsRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        setFollowings(snap.data());
      } else {
        setFollowings(null);
      }
      setLoading(false);
    }, err => console.warn(err));

    return () => {
      unsubFetchFollowings && unsubFetchFollowings();
    }
	}, [uid]);

  useEffect(() => {
    fetchFollowings();
  }, [fetchFollowings]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onRecommendBook = e => {
    e.preventDefault();
    const { fuid } = e.currentTarget.dataset;
    const { bid, covers, title } = book;

    const recommendation = {
      uid: fuid,
      bid,
      title,
      cover: covers[0]
    };

    const newNoteRef = notesRef(fuid).doc();
    const userName = displayName.split(' ')[0];
    const userDisplayName = truncateString(userName, 12);
    const noteMsg = `<a href="${app.url}/dashboard/${uid}">${userDisplayName}</a> ti consiglia il libro <a href="${app.url}/book/${bid}/${normURL(title)}">${title}</a>`;

    if (is.current) {
      userRecommendationsRef(uid).set({
        ...quote,
        uid,
        displayName,
        photoURL,
        amount: quote.amount - 1,
        recommends: count ? [
          ...quote.recommends, 
          recommendation
        ] : [recommendation]
      }).then(() => {
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: Date.now(),
          createdBy: user.displayName,
          createdByUid: uid,
          photoURL: user.photoURL,
          cover: book.covers[0],
          tag: ['recommendation'],
          read: false,
          uid: fuid
        }).then(() => {
          openSnackbar('Libro consigliato', 'success');
        }).catch(err => {
          openSnackbar(handleFirestoreError(err), 'error');
        });
      }).catch(err => {
        openSnackbar(handleFirestoreError(err), 'error');
      });
    }
  };

  const recommended = uid => count && quote.recommends.find(recobj => recobj.uid === uid && recobj.bid === book.bid);
  
  const usersList = obj => (
    Object.keys(obj).map(f => (
      <div key={f} className="avatar-row">
        <div className="row">
          <div className="col-auto">
            <Link to={`/dashboard/${f}`}>
              <Avatar className="avatar" src={obj[f].photoURL} alt={obj[f].displayName}>
                {!obj[f].photoURL && getInitials(obj[f].displayName)}
              </Avatar>
            </Link>
          </div>
          <div className="col">
            <div className="row">
              <div className="col name">{obj[f].displayName}</div>
              <div className="col-auto">
                <button
                  type="button"
                  className={`btn sm rounded ${recommended(f) ? 'success' : 'flat'}`}
                  data-fuid={f}
                  onClick={onRecommendBook}
                  disabled={quote.amount < 1 || recommended(f)}>
                  {recommended(f) ? <span>{icon.check} Consigliato</span> : 'Consiglia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  );

  const skltn = skltn_avatarRow(skltnLimit);

  const hasFollowings = followings && Object.keys(followings).length;

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="Recommend a book" className="dialog light book-recommendation" ref={is}>
        <div className="sticky-content">
          <div role="navigation" className="head nav">
            <div className="row">
              <div className="col"><strong>Consiglia <span className="hide-xs">a un amico</span></strong></div>
              <div className="col-auto"><span className="light-text">Quota giornaliera {quote.amount ? quote.amount : 'terminata'}</span></div>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="contacts-tab">
            {loading ? skltn : hasFollowings 
              ? usersList(followings) 
              : <div className="empty text-center">Non segui ancora nessun lettore</div>
            }
          </div>
        </div>
      </div>
    </>
  );
}

RecommendationForm.propTypes = {
  book: bookType.isRequired,
  onToggle: funcType.isRequired
}
 
export default RecommendationForm;