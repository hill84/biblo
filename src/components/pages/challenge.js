import classnames from 'classnames';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { challengeRef, userChallengesRef } from '../../config/firebase';
import { booksPerRow as _booksPerRow, app } from '../../config/shared';
import UserContext from '../../context/userContext';
import Cover from '../cover';
import { skltn_shelfRow } from '../skeletons';

const desc = true;

const Challenge = () => {
  const { user } = useContext(UserContext);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userChallenge, setUserChallenge] = useState(null);
  const [userChallenges, setUserChallenges] = useState(null);

  const { t } = useTranslation(['common']);

  const is = useRef(true);

  const fetch = useCallback(() => {
    if (user) {
      if (is.current) setLoading(true);
      
      userChallengesRef(user.uid).orderBy('created_num', desc ? 'desc' : 'asc').get().then(uSnap => {
        if (!uSnap.empty) {
          const userChallenges = [];

          uSnap.forEach(item => {
            // console.log(item.data());
            if (item.data().completed_num === 0) {
              if (item.data().cid) {
                challengeRef(item.data().cid).get().then(snap => {
                  if (snap.exists) {
                    if (is.current) {
                      setChallenge(snap.data());
                      setUserChallenge(item.data());
                    }
                  }
                }).catch(err => {
                  console.warn(err);
                  if (is.current) {
                    setChallenge(null);
                    setUserChallenge(null);
                  }
                }).finally(() => {
                  if (is.current) setLoading(false);
                });
              }
            } else {
              userChallenges.push(item.data());
            }
          });
          if (is.current) {
            setUserChallenges(userChallenges);
          }
        } else if (is.current) {
          setChallenge(null);
          setUserChallenges(null);
        }
      }).catch(err => {
        console.warn(err);
        if (is.current) {
          setChallenge(null);
          setUserChallenges(null);
        }
      }).finally(() => {
        if (is.current) setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  if (!user) return null;

  const count = books => Object.keys(books || []).length;
  const progress = books => (100 / count(books) * Object.keys(books).filter(item => books[item]).length).toFixed(0);

  return (
    <div className="container" ref={is}>
      <Helmet>
        <title>{app.name} | Sfida</title>
      </Helmet>

      <div className="row">
        <div className="col"><h2>Sfida in corso</h2></div>
        {userChallenge && (
          <div className="col text-right">
            <h4 className="counter light-text">Accettata il {new Date(userChallenge.created_num).toLocaleDateString()}</h4>
          </div>
        )}
      </div>
      <div className="card dark card-fullwidth-sm">
        <div className="head nav">
          <div className="row">
            <div className="col">
              <span className="primary-text hide-sm">
                {t('CHALLENGE')}:</span> <span className="counter last title">{userChallenge ? userChallenge.title : 'non trovata'}</span> <span className="count hide-xs">({t('BOOKS_COUNT', { count: count(userChallenge.books) })})
              </span>
            </div>
            {userChallenge && (
              <div className="col-4 col-sm-4 col-md-3 col-lg-2">
                <div className="row">
                  <div className="col flex">
                    <progress className="inprogress" max={100} value={progress(userChallenge.books)} />
                  </div>
                  <div className="col-auto">
                    <div className="counter last">{progress(userChallenge.books)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
            
        <div className="shelf scrollable">
          <div className="collection hoverable-items">
            {loading ? skltn_shelfRow : !userChallenge ? 'Sfida non trovata' : (
              <div key={userChallenge.cid} className={classnames('shelf-row', `books-per-row-${_booksPerRow}`, 'abreast')}>
                {Object.keys(userChallenge.books).map((bid, i) => (
                  <Link key={bid} to={`/book/${bid}`} className={userChallenge.books[bid] ? 'read' : 'not-read'}>
                    <Cover book={challenge.books[bid]} rating={false} index={i} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {!loading && userChallenges?.length > 0 && (
        <>
          <h2>Sfide completate</h2>
          {userChallenges.map((item, i) => (
            <div className="card dark card-fullwidth-sm" key={item.cid || i}>
              <div className="row">
                <div className="col">
                  <span className="primary-text hide-sm">
                    {t('CHALLENGE')}:</span> <span className="counter last title">{item.title}</span> <span className="count hide-xs">({t('BOOKS_COUNT', { count: count(item.books) })})
                  </span>
                </div>
                {item.completed_num !== 0 && (
                  <div className="col text-right">
                    <span className="counter light-text">Completata il {new Date(item.completed_num).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Challenge;