import { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import classnames from 'classnames';
import React, { FC, Fragment, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { followingsRef, notesRef, userRecommendationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, diffDates, getInitials, handleFirestoreError, normURL, truncateString } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/recommendationForm.css';
import { BookModel, CurrentTarget, FollowingsModel, RecommendationModel, RecommendModel } from '../../types';
import Overlay from '../overlay';
import { skltn_avatarRow } from '../skeletons';

const skltnLimit = 3;
const quoteLimit = 5;

let fetchCanceler: (() => void) | null = null;
let fetchFollowingsCanceler: (() => void) | null = null;

interface RecommendationFormProps {
  book: BookModel;
  onToggle: () => void;
}

const RecommendationForm: FC<RecommendationFormProps> = ({
  book,
  onToggle
}: RecommendationFormProps) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const uid = user?.uid;
  const displayName = user?.displayName;
  const photoURL = user?.photoURL; 
  const quoteInitialState: RecommendationModel = {
    uid,
    displayName,
    photoURL,
    amount: 5,
    timestamp: Date.now(),
    recommends: [],
  };
  const [quote, setQuote] = useState<RecommendationModel>(quoteInitialState);
  const [loading, setLoading] = useState<boolean>(false);
  const [followings, setFollowings] = useState<FollowingsModel | null>(null);
  
  const count: number = quote?.recommends ? quote?.recommends.length : 0;

  const initQuote = useCallback(() => setQuote({
    amount: 5,
    timestamp: Date.now(),
    recommends: [],
  }), [setQuote]);
  
  const fetch = useCallback(() => {
    setLoading(true);
    
    if (uid) {
      fetchCanceler = userRecommendationsRef(uid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setQuote(snap.data());
          setLoading(false);
        }
      }, (err: Error): void => console.warn(err));
    } else console.log('No uid');
  }, [uid]);
  
  const isNewDay: boolean = diffDates(24, quote.timestamp) > 0;
  
  useEffect(() => {
    if (!quote.timestamp || isNewDay) {
      initQuote();
    } else if (quote.amount > quoteLimit || count >= quoteLimit) {
      // Shallow fix frauds
      if (uid) {
        userRecommendationsRef(uid).set({
          ...quote,
          uid,
          displayName,
          photoURL,
          amount: 0,
          timestamp: Date.now()
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        });
      }
    }
  }, [count, displayName, initQuote, isNewDay, openSnackbar, photoURL, quote, uid]);

  const fetchFollowings = useCallback(() => {
    if (uid) {
      setLoading(true);
  
      fetchFollowingsCanceler = followingsRef(uid).onSnapshot((snap: DocumentData): void => {
        if (snap.exists) {
          setFollowings(snap.data());
        } else {
          setFollowings(null);
        }
        setLoading(false);
      }, (err: Error): void => console.warn(err));
    } else console.log('No uid');
  }, [uid]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    fetchFollowings();
  }, [fetchFollowings]);

  useEffect(() => () => {
    fetchCanceler?.();
    fetchFollowingsCanceler?.();
  }, []);

  const onRecommendBook = (e: MouseEvent): void => {
    e.preventDefault();
    const { fuid } = (e.currentTarget as CurrentTarget).dataset || {};
    const { bid, covers, title } = book;

    const recommendation = {
      uid: fuid,
      bid,
      title,
      cover: covers[0]
    };

    const newNoteRef: DocumentReference<DocumentData> = notesRef(fuid).doc();
    const userName: string = displayName?.split(' ')[0] || '';
    const userDisplayName: string = truncateString(userName, 12);
    const noteMsg = `<a href='${app.url}/dashboard/${uid}'>${userDisplayName}</a> ti consiglia il libro <a href='${app.url}/book/${bid}/${normURL(title)}'>${title}</a>`;

    if (uid) {
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
      }).then((): void => {
        newNoteRef.set({
          nid: newNoteRef.id,
          text: noteMsg,
          created_num: Date.now(),
          createdBy: user?.displayName || '',
          createdByUid: uid,
          photoURL: user?.photoURL || '',
          cover: book.covers[0],
          tag: ['recommendation'],
          read: false,
          uid: fuid
        }).then((): void => {
          openSnackbar('Libro consigliato', 'success');
        }).catch((err: FirestoreError): void => {
          openSnackbar(handleFirestoreError(err), 'error');
        });
      }).catch((err: FirestoreError): void => {
        openSnackbar(handleFirestoreError(err), 'error');
      });
    } else console.log('No uid');
  };

  const recommended = (uid: string): boolean => Boolean(count) && quote.recommends.some((recobj: RecommendModel): boolean => recobj.uid === uid && recobj.bid === book.bid);
  
  const usersList = (obj: FollowingsModel) => (
    Object.keys(obj).map((f: string) => (
      <div key={f} className='avatar-row'>
        <div className='row'>
          <div className='col-auto'>
            <Link to={`/dashboard/${f}`}>
              <Avatar className='avatar' src={obj[f].photoURL} alt={obj[f].displayName}>
                {!obj[f].photoURL && getInitials(obj[f].displayName)}
              </Avatar>
            </Link>
          </div>
          <div className='col'>
            <div className='row'>
              <div className='col name'>{obj[f].displayName}</div>
              <div className='col-auto'>
                <button
                  type='button'
                  className={classnames('btn', 'sm', 'rounded', recommended(f) ? 'success' : 'flat')}
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

  const hasFollowings: boolean = Boolean(followings) && Boolean(Object.keys(followings as FollowingsModel).length);

  return (
    <Fragment>
      <Overlay onClick={onToggle} />
      <div role='dialog' aria-describedby='Recommend a book' className='dialog book-recommendation'>
        <div className='sticky-content'>
          <div role='navigation' className='head nav'>
            <div className='row'>
              <div className='col'><strong>Consiglia <span className='hide-xs'>a un amico</span></strong></div>
              <div className='col-auto'><span className='light-text'>Quota giornaliera {quote.amount ? quote.amount : 'terminata'}</span></div>
            </div>
          </div>
        </div>
        <div className='content'>
          <div className='contacts-tab'>
            {loading ? skltn : hasFollowings && followings ? usersList(followings) : (
              <div className='empty text-center'>Non segui ancora nessun lettore</div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};
 
export default RecommendationForm;