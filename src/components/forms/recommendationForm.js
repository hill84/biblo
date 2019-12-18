import Avatar from '@material-ui/core/Avatar';
import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { followingsRef } from '../../config/firebase';
import { diffDays, getInitials, timestamp } from '../../config/shared';
import { bookType, funcType, stringType } from '../../config/types';
import Overlay from '../overlay';
import { skltn_avatarRow } from '../skeletons';
import { recommendationQuoteKey } from '../../config/storage';
import useLocalStorage from '../../hooks/useLocalStorage';
import icon from '../../config/icons';
import '../../css/recommendationForm.css';

const RecommendationForm = props => {
  const { book, openSnackbar, uid } = props;
  const [quote, setQuote] = useLocalStorage(recommendationQuoteKey, false);
  
  const [loading, setLoading] = useState(false);
  const [followings, setFollowings] = useState(null);
  
  const is = useRef(true);
  const count = quote && quote.recommends ? quote.recommends.length : 0;
  const skltnLimit = 3;
  const quoteLimit = 5;

  const initQuote = useCallback(() => setQuote({ amount: 5, timestamp, recommends: [] }), [setQuote]);
  const cleanQuote = useCallback(() => setQuote({ ...quote, amount: 0, timestamp }), [quote, setQuote]);
  const isNewDay = useMemo(() => diffDays(new Date(quote.timestamp)) > 0, [quote.timestamp]); 

  useEffect(() => {
    if (!quote || isNewDay) {
      initQuote();
    } else if (quote.amount > quoteLimit || count >= quoteLimit) {
      cleanQuote();
    }
  }, [count, initQuote, isNewDay, quote, cleanQuote]);

  const fetchFollowings = useCallback(() => {
    setLoading(true);
    const unsubFetchFollowings = followingsRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        setFollowings(snap.data());
        setLoading(false);
        // console.log({ uid, followings: snap.data() });
      } else {
        setFollowings(null);
        setLoading(false);
      }
    });

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

  const onToggle = () => props.onToggle();

  const onRecommendBook = e => {
    e.preventDefault();
    const { fuid } = e.currentTarget.dataset;
    const recommendation = {
      uid: fuid,
      bid: book.bid,
      title: book.title,
      cover: book.covers[0]
    };

    if (is.current) {
      // DO SOMETHING
      setQuote({
        ...quote,
        amount: quote.amount - 1,
        recommends: count ? [
          ...quote.recommends, 
          recommendation
        ] : [recommendation]
      });
      openSnackbar('Libro consigliato', 'success');
    }
  };

  const recommended = uid => count && quote.recommends.find(recobj => recobj.uid === uid && recobj.bid === book.bid);
  
  const usersList = obj => (
    Object.keys(obj).map(f => (
      <div key={f} className="avatar-row">
        <div className="row">
          <div className="col-auto">
            <Link to={`/dashboard/${f}`}>
              <Avatar className="avatar" src={obj[f].photoURL} alt={obj[f].displayName}>{!obj[f].photoURL && getInitials(obj[f].displayName)}</Avatar>
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
                  {recommended(f) ? <span>{icon.check()} Consigliato</span> : 'Consiglia'}
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
        <div className="content">
          {quote.amount ? 
            <p className="light-text"><small>Quota giornaliera <strong>{quote.amount}</strong></small></p> : 
            <p><small>Hai terminato la quota giornaliera</small></p>
          }
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
  onToggle: funcType.isRequired,
  openSnackbar: funcType.isRequired,
  uid: stringType.isRequired,
}
 
export default RecommendationForm;