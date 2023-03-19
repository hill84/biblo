import { Tooltip } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import type { TransitionProps } from '@material-ui/core/transitions';
import classnames from 'classnames';
import type { ChangeEvent, FC, ReactElement, Ref } from 'react';
import { forwardRef, lazy, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import Rater from 'react-rater';
import type { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { bookRef } from '../../config/firebase';
import icon from '../../config/icons';
import type { GenreModel } from '../../config/lists';
import { genres } from '../../config/lists';
import { abbrNum, app, calcDurationTime, calcReadingTime, normURL, setFormatClass, timeSince, translateURL, truncateString } from '../../config/shared';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/bookProfile.css';
import type { BookModel, UserBookModel } from '../../types';
import BookCollection from '../bookCollection';
import CopyToClipboard from '../copyToClipboard';
import Cover from '../cover';
import ReadingStateForm from '../forms/readingStateForm';
import RecommendationForm from '../forms/recommendationForm';
import ReviewForm from '../forms/reviewForm';
import Incipit from '../incipit';
import MinifiableText from '../minifiableText';
import Rating from '../rating';
import Reviews from '../reviews';
import ShareButtons from '../shareButtons';

const NoMatch = lazy(() => import('../noMatch'));

const Transition = forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

interface RateModel {
  type: string;
  rating: number;
}

interface BookProfileProps {
  // addReview: () => void;
  addBookToShelf: (bid: string) => void;
  addBookToShelfRef: Ref<HTMLButtonElement>;
  addBookToWishlist: (bid: string) => void;
  addBookToWishlistRef: Ref<HTMLButtonElement>;
  book?: BookModel;
  history: RouteComponentProps['history'];
  loading?: boolean;
  location: RouteComponentProps['location'];
  removeBookFromShelf: (bid: string) => void;
  removeBookFromWishlist: (bid: string) => void;
  // removeReview: () => void;
  rateBook: (bid: string, rate: number) => void;
  onEditing: () => void;
  userBook: UserBookModel;
}

type ISBNType = 'ISBN_10' | 'ISBN_13';

const BookProfile: FC<BookProfileProps> = ({
  addBookToShelf,
  addBookToShelfRef,
  addBookToWishlist,
  addBookToWishlistRef,
  // addReview,
  book,
  history,
  onEditing,
  loading,
  location,
  rateBook,
  removeBookFromShelf,
  removeBookFromWishlist,
  // removeReview,
  userBook: _userBook
}: BookProfileProps) => {
  const { isAdmin, isAuth, isEditor } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  // const [errors, setErrors] = useState({});
  const [ISBN, setISBN] = useState<ISBNType>('ISBN_13');
  const [isOpenRemoveDialog, setIsOpenRemoveDialog] = useState<boolean>(false);
  const [isOpenReadingState, setIsOpenReadingState] = useState<boolean>(false);
  const [isOpenRecommendation, setIsOpenRecommendation] = useState<boolean>(false);
  const [isOpenIncipit, setIsOpenIncipit] = useState<boolean>(location?.pathname?.indexOf('/incipit') !== -1);
  const [userBook, setUserBook] = useState<UserBookModel>(_userBook);

  const { t } = useTranslation(['common', 'form', 'lists']);

  useEffect(() => {
    setUserBook(_userBook);
  }, [_userBook]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsOpenIncipit(location.pathname.indexOf('/incipit') !== -1);
  }, [location.pathname]);

  const onAddBookToShelf = (): void => book && addBookToShelf(book.bid);

  const onAddBookToWishlist = (): void => book && addBookToWishlist(book.bid);

  const onRemoveBookFromShelf = (): void => {
    setIsOpenRemoveDialog(false);
    book && removeBookFromShelf(book.bid);
  };

  const onRemoveBookFromShelfRequest = (): void => setIsOpenRemoveDialog(true);

  const onCloseRemoveDialog = (): void => setIsOpenRemoveDialog(false);

  const onRemoveBookFromWishlist = (): void => book && removeBookFromWishlist(book.bid);

  const onRateBook = (rate: RateModel): void => {
    if (rate.type === 'click' && book) {
      rateBook(book.bid, rate.rating);
      setUserBook({ ...userBook, rating_num: rate.rating });
    }
  };

  const onToggleIncipit = (): void => {
    setIsOpenIncipit(!isOpenIncipit);

    history.push(location.pathname.indexOf('/incipit') === -1 
      ? `${location.pathname}/incipit` 
      : location.pathname.replace('/incipit', ''), null);
  };

  const onToggleReadingState = (): void => setIsOpenReadingState(!isOpenReadingState);

  const onToggleSuggest = (): void => setIsOpenRecommendation(!isOpenRecommendation); 

  const onLock = (): void => {
    if (book && book.bid && book.EDIT) {
      const state: boolean = book.EDIT.edit;

      if (state) {
        // console.log(`Locking ${id}`);
        bookRef(book.bid).update({ 'EDIT.edit': false }).then((): void => {
          openSnackbar(t('form:SUCCESS_LOCKED_ITEM'), 'success');
        }).catch((err: Error): void => console.warn(err));
      } else {
        // console.log(`Unlocking ${id}`);
        bookRef(book.bid).update({ 'EDIT.edit': true }).then((): void => {
          openSnackbar(t('form:SUCCESS_UNLOCKED_ITEM'), 'success');
        }).catch((err: Error): void => console.warn(err));
      }
    }
  };

  const onChangeISBN = (e: ChangeEvent<HTMLSelectElement>): void => setISBN(e.target.value as ISBNType);

  const _lastEditBy: string = book?.EDIT.lastEditBy || '';
  const _createdBy: string = book?.EDIT.createdBy || '';
  const lastEditBy = useMemo((): string => truncateString(_lastEditBy, 25), [_lastEditBy]);
  const createdBy = useMemo((): string => truncateString(_createdBy, 25), [_createdBy]);
  const hasBid = Boolean(book?.bid);
  const isLocked: boolean = !book?.EDIT.edit && !isAdmin;
  const bookAuthors = useMemo((): string[] => {
    return book?.authors ? Object.keys(book.authors).sort((a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0) : [];
  }, [book?.authors]);

  if (!book && !loading) return (
    <NoMatch title={t('BOOK_NOT_FOUND')} history={history} location={location} />
  );

  const GenresList: FC = () => (
    <>
      {book?.genres.map((genre: string) => {
        const getLabel = (genre: string): string => {
          const canonical: string = genres.find(({ name }: GenreModel): boolean => name === genre)?.canonical || '';
          return t(`lists:GENRE_${translateURL(canonical)}`);
        };

        return (
          <Link to={`/genre/${normURL(genre)}`} className='counter' key={genre}>
            {getLabel(genre)}
          </Link>
        );
      })}
    </>
  );

  // const authors = book && <Link to={`/author/${normURL(Object.keys(book.authors)[0])}`}>{Object.keys(book.authors)[0]}</Link>;

  return (
    <>
      {book && isOpenIncipit && (
        <Incipit 
          title={book.title} 
          incipit={book.incipit} 
          copyrightHolder={book.publisher} 
          publication={book.publication} 
          onToggle={onToggleIncipit} 
        />
      )}
    
      <div id='bookProfile'>
        {book && isOpenReadingState && (
          <ReadingStateForm
            bid={book.bid}
            readingState={userBook.readingState}
            onToggle={onToggleReadingState}
            pages={book.pages_num}
          />
        )}

        {book && isOpenRecommendation && (
          <RecommendationForm
            book={book}
            onToggle={onToggleSuggest}
          />
        )}

        <div className='container top'>
          <div className='card light main text-center-md'>
            <div className='row relative'>
              {((book?.EDIT && isAdmin) || book?.awards) && (
                <div className='absolute-content right bookdetails' style={{ zIndex: 1, }}>
                  {book?.awards?.map(award => (
                    <Tooltip title={award} key={award}>
                      <span className='counter popIn reveal delay2 accent-text'>{icon.medal}</span>
                    </Tooltip>
                  ))}
                  {book?.EDIT && isAdmin && (
                    <Tooltip interactive title={book.EDIT.lastEdit_num ? (
                      <span>{t('EDITED_BY')} <Link to={`/dashboard/${book.EDIT.lastEditByUid}`}>{lastEditBy}</Link> {timeSince(book.EDIT.lastEdit_num)}</span> 
                    ) : (
                      <span>{t('CREATED_BY')} <Link to={`/dashboard/${book.EDIT.createdByUid}`}>{createdBy}</Link> {timeSince(book.EDIT.created_num)}</span>
                    )}>
                      <span className='counter'>{icon.informationOutline}</span>
                    </Tooltip>
                  )}
                </div>
              )}
              <div className='col-md-auto col-sm-12' style={{ marginBottom: 15, }}>
                <div
                  tabIndex={0}
                  role='button'
                  className={classnames('text-center', `${book ? setFormatClass(book.format) : 'book'}-format`, { 'hoverable-items': book?.incipit })}
                  onClick={book?.incipit ? onToggleIncipit : undefined}
                  onKeyDown={book?.incipit ? onToggleIncipit : undefined}>
                  <Cover book={book} rating={false} showMedal={false} info={false} />
                  {book?.incipit && (
                    <button type='button' className='btn xs rounded flat centered btn-incipit'>
                      {t('ACTION_READ_INCIPIT')}
                    </button>
                  )}
                </div>
                
                {book && (
                  <>
                    {book.trailerURL && (
                      <button type='button' onClick={() => window.open(book.trailerURL, '_blank')} className='btn xs rounded flat centered btn-trailer'>Trailer</button>
                    )}

                    <ShareButtons 
                      className='btn-share-container'
                      // hashtags={['biblo', 'libri', 'twittalibro']}
                      // cover={book.covers && book.covers[0]}
                      text={`${userBook.bookInShelf ? 'Ho aggiunto alla mia libreria' : userBook.bookInWishlist ? 'Ho aggiunto alla mia lista dei desideri' : 'Consiglio'} il libro '${book.title}' di ${Object.keys(book.authors)[0]}. Leggi un estratto su ${app.name}.`}
                      url={`${app.url}${location.pathname}`}
                      via='BibloSpace'
                    />
                  </>
                )}
              </div>

              <div className='col book-profile'>
                <h2 className='title flex'>
                  {loading ? <span className='skltn area' /> : book && (
                    <>
                      {book.title} <span className='mention'>
                        <CopyToClipboard icon={icon.at} text={`@book/${book.bid}/${normURL(book.title)}`}/>
                      </span>
                    </>
                  )}
                </h2>
                {book?.subtitle && <h3 className='subtitle'>{book.subtitle}</h3>}
                {loading ? (
                  <div className='skltn rows' style={{ marginTop: '2em', }} />
                ) : book && (
                  <>
                    <div className='info-row'>
                      {book.authors && <span className='counter comma author'>{t('BY').toLowerCase()} {bookAuthors.map((author: string) => 
                        <Link to={`/author/${normURL(author)}`} className='counter' key={author}>{author}</Link> 
                      )}</span>}
                      {book.publisher && <span className='counter hide-sm'>{t('PUBLISHER')} <b>{book.publisher}</b></span>}
                      {isAuth && hasBid && isEditor && (
                        <>
                          {isAdmin && (
                            <button type='button' onClick={onLock} className={classnames('link', 'counter', book.EDIT.edit ? 'flat' : 'active')}>
                              <span className='show-sm'>{book.EDIT.edit ? icon.lock : icon.lockOpen}</span>
                              <span className='hide-sm'>{t(book.EDIT.edit ? 'ACTION_LOCK' : 'ACTION_UNLOCK')}</span>
                            </button>
                          )}
                          <button type='button' onClick={onEditing} className='link counter' disabled={isLocked} title={t('EDIT_DISABLED')}>
                            <span className='show-sm'>{book.EDIT.edit ? icon.pencil : icon.pencilOff}</span>
                            <span className='hide-sm'>{t('ACTION_EDIT')}</span>
                          </button>
                          <button type='button' className='link counter' onClick={onToggleSuggest}>
                            <span className='show-sm'>{icon.accountHeart}</span>
                            <span className='hide-sm'>{t('ACTION_RECOMMEND')}</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className='info-row hide-sm'>
                      <span className='counter'>
                        <Tooltip title='Cambia tipo ISBN'>
                          <select className='select-isbn' onChange={onChangeISBN} defaultValue={ISBN} disabled={book.ISBN_10 === 0}>
                            <option value='ISBN_13'>ISBN-13</option>
                            <option value='ISBN_10'>ISBN-10</option>
                          </select>
                        </Tooltip> <b><CopyToClipboard text={book[ISBN]}/></b>
                      </span>
                      {/* book.ISBN_10 !== 0 && <span className='counter'>ISBN-10 <CopyToClipboard text={book.ISBN_10}/></span> */}
                      {book.publication && <span className='counter'>{t('PUBLICATION')} <b>{new Date(book.publication).toLocaleDateString()}</b></span>}
                      {/* book.edition_num !== 0 && <span className='counter'>Edizione <b>{book.edition_num}</b></span> */}
                      {book.format !== 'Audio' && book.pages_num !== 0 && <span className='counter'>{t('PAGES')} <b>{book.pages_num}</b></span>}
                      {book.format === 'Audio' && book.duration && <span className='counter'>{t('DURATION')} <b>{calcDurationTime(book.duration)}</b></span>}
                      {book.format === 'Audio' && <span className='counter'>{t('FORMAT')} <b>{book.format.toLowerCase()}</b></span>}
                      {Boolean(book.genres?.length) && <span className='counter comma'>{t(book.genres[1] ? 'GENRES' : 'GENRE')} <GenresList /></span>}
                      {book.collections && book.collections[0] && <span className='counter comma'>{t(book.collections[1] ? 'COLLECTIONS' : 'COLLECTION')} {book.collections.map(collection => <Link to={`/collection/${normURL(collection)}`} className='counter' key={collection}>{collection}</Link> )}</span>}
                    </div>

                    <div className='info-row'>
                      <Rating labels ratings={{ ratings_num: book ? book.ratings_num : 0, rating_num: book ? book.rating_num : 0 }}/>
                    </div>

                    {isAuth && (
                      <>
                        <div className='info-row'>
                          {userBook.bookInShelf ? (
                            <>
                              <button
                                type='button'
                                className='btn success rounded error-on-hover'
                                onClick={onRemoveBookFromShelfRequest}>
                                <span className='hide-on-hover'>{icon.check} {t('SHELF')}</span>
                                <span className='show-on-hover'>{icon.close} {t('SHELF')}</span>
                              </button>
                              <button
                                type='button'
                                className='btn rounded'
                                onClick={onToggleReadingState}>
                                {t('READING_STATE')}
                              </button>
                            </>
                          ) : (
                            <button
                              type='button'
                              className='btn primary rounded'
                              ref={addBookToShelfRef}
                              disabled={!hasBid || !isEditor}
                              onClick={onAddBookToShelf}>
                              {icon.plus} {t('SHELF')}
                            </button>
                          )}
                          {userBook.bookInWishlist && (
                            <button type='button' className='btn success rounded error-on-hover' onClick={onRemoveBookFromWishlist}>
                              <span className='hide-on-hover'>{icon.check} {t('WISHLIST')}</span>
                              <span className='show-on-hover'>{icon.close} {t('WISHLIST')}</span>
                            </button>
                          )}
                          {(!userBook.bookInWishlist && !userBook.bookInShelf) && (
                            <button
                              type='button'
                              className='btn flat rounded'
                              ref={addBookToWishlistRef}
                              disabled={!hasBid || !isEditor}
                              onClick={onAddBookToWishlist}>
                              {icon.plus} {t('WISHLIST')}
                            </button>
                          )}
                        </div>
                        {userBook.bookInShelf && (
                          <div className='info-row fadeIn reveal'>
                            <div className='user rating'>
                              <Rater total={5} onRate={rate => onRateBook(rate)} rating={userBook.rating_num || 0} />
                              {/* <span className='rating-num'>{userBook.rating_num || 0}</span> */}
                              <span className='label'>{t('YOUR_VOTE')}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {book.description && (
                      <div className='info-row description'>
                        <MinifiableText text={book.description} maxChars={700} />
                      </div>
                    )}

                    <div className='info-row bookdetails'>
                      <span className='counter'>{icon.reader} <b>{abbrNum(book.readers_num || 0)}</b> <span className='hide-sm'>{t(book.readers_num === 1 ? 'READER' : 'READERS')}</span></span>
                      <span className='counter'>{icon.messageTextOutline} <b>{abbrNum(book.reviews_num || 0)}</b> <span className='hide-sm'>{t(book.reviews_num === 1 ? 'REVIEW' : 'REVIEWS')}</span></span>
                      {book.pages_num && <span className='counter'>{icon.timer} <span className='hide-sm'>{t('READING_TIME')}</span> <b>{calcReadingTime(book.pages_num)}</b></span>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {book && (
          <div className='container'>
            {book.bid && (
              <>
                {isAuth && isEditor && userBook.bookInShelf && (
                  <ReviewForm
                    // addReview={addReview}
                    bid={book.bid}
                    // removeReview={removeReview}
                    userBook={userBook}
                  />
                )}
                <Reviews bid={book.bid} />
                {book.collections?.[0] && (
                  <InView triggerOnce rootMargin='200px'>
                    {({ inView, ref }) => (
                      <div className='card dark card-fullwidth-sm' ref={ref} style={{ marginBottom: 0, }}>
                        <BookCollection cid={book.collections?.[0] as string} pagination={false} limit={7} inView={inView} scrollable />
                      </div>
                    )}
                  </InView>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {isOpenRemoveDialog && (
        <Dialog
          open={isOpenRemoveDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={onCloseRemoveDialog}
          aria-labelledby='remove-dialog-title'
          aria-describedby='remove-dialog-description'>
          <DialogTitle>
            {t('DIALOG_REMOVE_TITLE')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('DIALOG_REMOVE_USER_BOOK_PARAGRAPH')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className='dialog-footer no-gutter'>
            <button type='button' className='btn btn-footer flat' onClick={onCloseRemoveDialog}>{t('ACTION_CANCEL')}</button>
            <button type='button' className='btn btn-footer primary' onClick={onRemoveBookFromShelf}>{t('ACTION_PROCEED')}</button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
 
export default BookProfile;