import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Rater from 'react-rater';
import { userBooksRef } from '../config/firebase';
import icon from '../config/icons';
import { months, ratingLabels, readingStates } from '../config/lists';
import { diffDates, handleFirestoreError, round } from '../config/shared';
import { userBooksKey } from '../config/storage';
import { boolType, stringType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/readingStats.css';
import useLocalStorage from '../hooks/useLocalStorage';

const shelf = 'bookInShelf';
const votes = [1, 2, 3, 4, 5];
const switchContainerStyle = { top: -22, left: 'inherit', right: -14, };

const ReadingStats = props => {
  const { isAuth } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { loading: isLoading, uid } = props;
  const [userBooks, setUserBooks] = useLocalStorage(`${uid}_${userBooksKey.books}`, null);
  const [timestamp, setTimestamp] = useLocalStorage(`${uid}_${userBooksKey.timestamp}`, null);
  const [loading, setLoading] = useState(isLoading);
  const [rangeYear, setRangeYear] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const is = useRef(true);

  const isNewDay = useMemo(() => diffDates(24, new Date(timestamp)) > 0, [timestamp]);

  useEffect(() => {
    if (!timestamp || !userBooks || isNewDay) {
      userBooksRef(uid).where(shelf, '==', true).get().then(snap => {
        if (!snap.empty) {
          const items = [];
          snap.forEach(item => items.push(item.data()));
          // console.log(items);
          if (is.current) {
            setUserBooks(items);
            setTimestamp(Date.now());
          }
        }
      }).catch(err => {
        openSnackbar(handleFirestoreError(err), 'error');
        if (is.current) setUserBooks(null);
      }).finally(() => {
        if (is.current) setLoading(false);
      });
    } else setLoading(isLoading || false);
    // eslint-disable-next-line
  }, [isLoading, isNewDay, openSnackbar, timestamp, uid, userBooks]);

  useEffect(() => {
    if (!isAuth) {
      if (is.current) {
        setUserBooks(null);
        setTimestamp(null);
      }
    }
    // eslint-disable-next-line
  }, [isAuth]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onToggleRange = () => () => { // name => e =>
    setRangeYear(r => !r);
  };

  const onToggleTable = () => setShowTable(s => !s);
  
  const ratedBooks = useMemo(() => votes.map(num => userBooks ? userBooks.filter(item => item.rating_num === num).length : 0), [userBooks]);

  const booksByState = useMemo(() => readingStates.map((state, i) => (
    userBooks?.filter(item => (
      item.readingState.state_num === (i + 1)
    )).length
  )), [userBooks]);

  const booksRead = useMemo(() => userBooks?.filter(book => book.readingState.end_num), [userBooks]);
  
  const yearsRead = useMemo(() => booksRead && [...new Set(booksRead.reduce((res, book) => {
    if (book.readingState.end_num) res.push(new Date(book.readingState.end_num).getFullYear());
    return res;
  }, []))].sort((a, b) => b - a), [booksRead]);
  
  const totalBooksRead = useMemo(() => booksRead?.length, [booksRead]);
  const totalPagesRead = useMemo(() => booksRead?.reduce((acc, book) => acc + book.pages_num, 0), [booksRead]);
  const avgPagesRead = useMemo(() => booksRead && round(totalPagesRead / (yearsRead.length * 12)), [booksRead, totalPagesRead, yearsRead]);
  const totalRatings = useMemo(() => booksRead?.reduce((acc, book) => acc + (book.rating_num ? 1 : 0), 0), [booksRead]);
  const totalRating_num = useMemo(() => booksRead?.reduce((acc, book) => acc + book.rating_num, 0), [booksRead]);
  const avgRating = useMemo(() => booksRead && round(totalRating_num / totalRatings), [booksRead, totalRating_num, totalRatings]);
  const totalReviews = useMemo(() => booksRead?.reduce((acc, book) => acc + (book.review.text ? 1 : 0), 0), [booksRead]);

  const readByYear = useMemo(() => yearsRead?.map(year => {
    const books = booksRead.filter(book => new Date(book.readingState.end_num).getFullYear() === year);
    return ({ year, books_num: books.length, books });
  }), [booksRead, yearsRead]);

  const monthsArr = useMemo(() => months.map(m => m.id), []);

  const currentYearBooks = useMemo(() => !rangeYear && booksRead?.filter(book => new Date(book.readingState.end_num).getFullYear() === new Date().getFullYear()), [booksRead, rangeYear]);

  const readByMonth = useMemo(() => !rangeYear && monthsArr?.map((month, i) => currentYearBooks?.filter(book => new Date(book.readingState.end_num).getMonth() === i).length), [currentYearBooks, monthsArr, rangeYear]);
  
  const item = useCallback(year => readByYear.filter(item => item.year === year)[0], [readByYear]);
  const pages = useCallback(item => item.books.reduce((acc, book) => {
    if (book.pages_num) return acc + book.pages_num;
    return null;
  }, 0), []);
  const ratings_num = useCallback(item => item.books?.reduce((acc, book) => acc + (book.rating_num ? 1 : 0), 0), []);
  const ratings = useCallback(item => item.books?.reduce((acc, book) => acc + book.rating_num, 0), []);
  const reviews_num = useCallback(item => item.books?.reduce((acc, book) => acc + (book.review.text ? 1 : 0), 0), []);
  
  const data = useMemo(() => ((rangeYear && yearsRead) || (!rangeYear && monthsArr)) && {
    labels: rangeYear ? yearsRead : monthsArr,
    datasets: [{
      backgroundColor: 'rgba(0, 151, 167, .5)',
      hoverBackgroundColor: 'rgba(0, 151, 167, .8)',
      data: rangeYear ? readByYear.map(b => b.books_num) : readByMonth
    }]
  }, [monthsArr, rangeYear, readByMonth, readByYear, yearsRead]);
  
  const options = useMemo(() => ({
    maintainAspectRatio: false,
    legend: { display: false },
    scales: {
      yAxes: [{
        ticks: {
          min: 0,
          suggestedMax: rangeYear ? 6 : 2,
          stepSize: 1
        }
      }]
    },
    tooltips: { enabled: false }
  }), [rangeYear]);
  
  const tableSkltn = useMemo(() => [...Array(data ? 3 : 5)].map((e, i) => <li key={i} className="avatar-row skltn dash" />), [data]);
  
  if (!loading && !userBooks) return <div className="text-center">Statistiche non disponibili</div>
  
  return (
    <div ref={is}>
      <div className="head row">
        <h2 className="col">
          Statistiche <span className="hide-sm">di lettura</span> <Tooltip title={`Aggiornate ogni 24 ore. Conteggiano solo i libri segnati come "letti" con una "data di fine" nello "stato di lettura".`}><button type="button" className="link">{icon.informationOutline}</button></Tooltip>
        </h2>
        {timestamp && <span className="col-auto text-sm light-text"><span className="hide-sm">Aggiornate al</span> {new Date(timestamp).toLocaleString()}</span>}
      </div>

      <div className="row">
        <div className="col">
          {data && (
            <div className="relative chart-container">
              <span className="absolute-content pull-right text-sm" style={switchContainerStyle}>
                <FormControlLabel control={
                  <>
                    <span className={rangeYear ? 'light-text' : 'primary-text'}>12 mesi</span>
                    <Switch checked={rangeYear} color="default" onChange={onToggleRange()} size="small" />
                    <span className={rangeYear ? 'primary-text' : 'light-text'}>{yearsRead?.length} Anni</span>
                  </>
                } />
              </span>
              <Bar data={data} height={170} options={options} />
            </div>
          )}
        </div>
      </div>

      {showTable ? (
        <div className="row reveal fadeIn slideDown">
          <div className="col-xl-9 col-lg-8 col-12">

            <div className="row">
              <div className="col-lg-11 col">
                <h3>Statistiche avanzate</h3>
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
                  {loading ? tableSkltn : yearsRead?.length ? (
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

          <div className="col col-lg-auto">
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
      ) : (
        <button type="button" className="btn sm rounded flat centered" onClick={onToggleTable}>Mostra statistiche avanzate</button>
      )}
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