import Tooltip from '@material-ui/core/Tooltip';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Rater from 'react-rater';
import { userBooksRef } from '../config/firebase';
import icon from '../config/icons';
import { ratingLabels, readingStates } from '../config/lists';
import { diffDays, handleFirestoreError, round } from '../config/shared';
import { userBooksKey } from '../config/storage';
import { boolType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import '../css/readingStats.css';
import useLocalStorage from '../hooks/useLocalStorage';
import UserContext from '../context/userContext';

const shelf = 'bookInShelf';
const votes = [1, 2, 3, 4, 5];

const ReadingStats = props => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { loading: isLoading, uid } = props;
  const [loading, setLoading] = useState(isLoading);
  const [userBooks, setUserBooks] = useLocalStorage(`${uid}_${userBooksKey.books}`, null);
  const [timestamp, setTimestamp] = useLocalStorage(`${uid}_${userBooksKey.timestamp}`, null);
  const is = useRef(true);

  const isNewDay = useMemo(() => diffDays(new Date(timestamp)) > 0, [timestamp]);

  useEffect(() => {
    if (!timestamp || !userBooks || isNewDay) {
      userBooksRef(uid).where(shelf, '==', true).get().then(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          // console.log(items);
          if (is.current) {
            setUserBooks(items);
            setLoading(false);
            setTimestamp(Date.now());
          }
        }
      }).catch(err => {
        openSnackbar(handleFirestoreError(err), 'error');
        if (is.current) {
          setUserBooks(null);
          setLoading(false);
        }
      });
    } else setLoading(isLoading || false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isNewDay, openSnackbar, timestamp, uid, userBooks]);

  useEffect(() => {
    if (!isAuth) {
      if (is.current) {
        setUserBooks(null);
        setTimestamp(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  useEffect(() => () => {
    is.current = false;
  }, []);
  
  const ratedBooks = useMemo(() => votes.map(num => userBooks ? userBooks.filter(item => item.rating_num === num).length : 0), [userBooks]);

  const booksByState = useMemo(() => readingStates.map((state, i) => (
    userBooks && userBooks.filter(item => (
      item.readingState.state_num === (i + 1)
    )).length
  )), [userBooks]);

  const booksRead = useMemo(() => userBooks && userBooks.filter(book => book.readingState.end_num), [userBooks]);
  
  const yearsRead = useMemo(() => booksRead && [...new Set(booksRead.reduce((res, book) => {
    if (book.readingState.end_num) res.push(new Date(book.readingState.end_num).getFullYear());
    return res;
  }, []))].sort((a, b) => b - a), [booksRead]);
  
  const totalBooksRead = useMemo(() => booksRead && booksRead.length, [booksRead]);
  const totalPagesRead = useMemo(() => booksRead && booksRead.reduce((acc, book) => acc + book.pages_num, 0), [booksRead]);
  const avgPagesRead = useMemo(() => booksRead && round(totalPagesRead / (yearsRead.length * 12)), [booksRead, totalPagesRead, yearsRead]);
  const totalRatings = useMemo(() => booksRead && booksRead.reduce((acc, book) => acc + (book.rating_num ? 1 : 0), 0), [booksRead]);
  const totalRating_num = useMemo(() => booksRead && booksRead.reduce((acc, book) => acc + book.rating_num, 0), [booksRead]);
  const avgRating = useMemo(() => booksRead && round(totalRating_num / totalRatings), [booksRead, totalRating_num, totalRatings]);
  const totalReviews = useMemo(() => booksRead && booksRead.reduce((acc, book) => acc + (book.review.text ? 1 : 0), 0), [booksRead]);

  const readByYear = useMemo(() => yearsRead && yearsRead.map(year => {
    const books = booksRead.filter(book => new Date(book.readingState.end_num).getFullYear() === year);
    return ({ year, books_num: books.length, books });
  }), [booksRead, yearsRead]);
  
  const item = useCallback(year => readByYear.filter(item => item.year === year)[0], [readByYear]);
  const pages = useCallback(item => item.books.reduce((acc, book) => {
    if (book.pages_num) return acc + book.pages_num;
    return null;
  }, 0), []);
  const ratings_num = useCallback(item => item.books && item.books.reduce((acc, book) => acc + (book.rating_num ? 1 : 0), 0), []);
  const ratings = useCallback(item => item.books && item.books.reduce((acc, book) => acc + book.rating_num, 0), []);
  const reviews_num = useCallback(item => item.books && item.books.reduce((acc, book) => acc + (book.review.text ? 1 : 0), 0), []);
  
  if (!loading && !userBooks) return <div className="text-center">Statistiche non disponibili</div>

  const tableSkltn = [...Array(6)].map((e, i) => <li key={i} className="avatar-row skltn dash" />);

  return (
    <div ref={is}>
      <div className="head row">
        <h2 className="col">Statistiche <span className="hide-sm">di lettura</span> <Tooltip title={`Aggiornate ogni 24 ore. Conteggiano solo i libri segnati come "letti" con una "data di fine" nello "stato di lettura".`}><button className="link">{icon.informationOutline}</button></Tooltip></h2>
        {timestamp && <span className="col-auto text-sm light-text">Aggiornate al {new Date(timestamp).toLocaleString()}</span>}
      </div>

      <div className="row">
        
        <div className="col-lg-9 col-12">
          <div className="row">
            <div className="col-lg-11 col">
              <ul className="table dense nolist font-sm">
                <li className="labels">
                  <div className="row">
                    <div className="col">Anno</div>
                    <div className="col">Libri</div>
                    <div className="col">Pagine</div>
                    <div className="col hide-sm">Pag/mese</div>
                    <div className="col">Voti</div>
                    <div className="col hide-xs">Voto medio</div>
                    <div className="col">Recensioni</div>
                  </div>
                </li>
                {loading ? tableSkltn : yearsRead && yearsRead.length ? (
                  <>
                    {yearsRead.map(year => (
                      <li className="avatar-row" key={year}>
                        <div className="row">
                          <div className="col"><b>{year}</b></div>
                          <div className="col">{item(year).books_num}</div>
                          <div className="col">{pages(item(year)) || 0}</div>
                          <div className="col hide-sm">{pages(item(year)) ? round(pages(item(year)) / 12) : '-'}</div>
                          <div className="col">{ratings_num(item(year))}</div>
                          <div className="col hide-xs">{round(ratings(item(year)) / item(year).books_num)}</div>
                          <div className="col">{reviews_num(item(year))}</div>
                        </div>
                      </li>
                    ))}
                    <li className="avatar-row">
                      <div className="row">
                        <div className="col"><b>Totale</b></div>
                        <div className="col">{totalBooksRead}</div>
                        <div className="col">{totalPagesRead}</div>
                        <Tooltip title={`${totalPagesRead} pagine / ${yearsRead.length * 12} mesi`}><div className="col hide-sm">{avgPagesRead}</div></Tooltip>
                        <div className="col">{totalRatings}</div>
                        <div className="col hide-xs">{avgRating}</div>
                        <div className="col">{totalReviews}</div>
                      </div>
                    </li>
                  </>
                ) : <li className="empty avatar-row text-center">Nessun libro letto</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="col">
          <h3>Stato lettura</h3>
          <ul className="nolist stats-list">
            {readingStates.map((state, i) => (
              <li key={i} className={booksByState[i] ? null : 'light-text'}><b>{booksByState[i]}</b> {state}</li>
            ))}
          </ul>
        </div>
        
        <div className="col-lg-auto col">
          <h3>Voti</h3>
          {ratedBooks && (
            <ul className="nolist stats-list">
              {ratedBooks.map((item, i) => (
                <li key={i} className={item ? null : 'light-text disabled'}>
                  <b>{item}</b> <Rater
                    interactive={false}
                    rating={i + 1}
                    title={ratingLabels[i + 1]}
                    total={ratedBooks.length}
                  />
                </li>
              ))}
            </ul>
          )}          
        </div>

      </div>
    </div>
  );
}

ReadingStats.propTypes = {
  loading: boolType,
  uid: stringType.isRequired
};

ReadingStats.defaultProps = {
  loading: true
};
 
export default ReadingStats;