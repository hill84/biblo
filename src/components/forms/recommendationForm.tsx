import type { DocumentData, DocumentReference, FirestoreError } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import classnames from 'classnames';
import type { FC, MouseEvent } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { followingsRef, notesRef, userRecommendationsRef } from '../../config/firebase';
import icon from '../../config/icons';
import { app, diffDates, getInitials, handleFirestoreError, normURL, truncateString } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/recommendationForm.css';
import type { BookModel, CurrentTarget, FollowingsModel, RecommendModel, RecommendationModel } from '../../types';
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

  const { t } = useTranslation(['common']);
  
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
    const userDisplayName: string = truncateString(userName, 25);
    {/* TODO: translate */}
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
          openSnackbar(t('SUCCESS_BOOK_RECOMMENDED'), 'success');
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
                  {recommended(f) ? <span>{icon.check} {t('ACTION_RECOMMENDED')}</span> : t('ACTION_RECOMMEND')}
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
    <>
      <Overlay onClick={onToggle} />
      <div role='dialog' aria-describedby='Recommend a book' className='dialog book-recommendation'>
        <div className='sticky-content'>
          <div role='navigation' className='head nav'>
            <div className='row'>
              <div className='col'><strong>{t('ACTION_RECOMMEND')} <span className='hide-xs'>{t('TO_A_FRIEND')}</span></strong></div>
              <div className='col-auto'><span className='light-text'>{t('DAILY_RATE')} {quote.amount ? quote.amount : t('TERMINATED_female')}</span></div>
            </div>
          </div>
        </div>
        <div className='content'>
          <div className='contacts-tab'>
            {loading ? skltn : hasFollowings && followings ? usersList(followings) : (
              <div className='empty text-center'>{t('NO_USER_FOLLOWINGS')}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
 
export default RecommendationForm;