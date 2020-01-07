import { Tooltip } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { InView } from 'react-intersection-observer';
import Rater from 'react-rater';
import { Link } from 'react-router-dom';
import { bookRef, isAuthenticated } from '../../config/firebase';
import icon from '../../config/icons';
import { abbrNum, app, calcReadingTime, hasRole, msToTime, normURL, setFormatClass, timeSince } from '../../config/shared';
import { bookType, boolType, funcType, locationType, objectType, refType, userBookType } from '../../config/types';
import SnackbarContext from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/bookProfile.css';
import BookCollection from '../bookCollection';
import CopyToClipboard from '../copyToClipboard';
import Cover from '../cover';
import ReadingStateForm from '../forms/readingStateForm';
import RecommendationForm from '../forms/recommendationForm';
import Incipit from '../incipit';
import MinifiableText from '../minifiableText';
import NoMatch from '../noMatch';
import Rating from '../rating';
import Reviews from '../reviews';
import ShareButtons from '../shareButtons';
import UserReview from '../userReview';

const Transition = forwardRef((props, ref) => <Grow {...props} ref={ref} /> );

const BookProfile = props => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const {
    addBookToShelf,
    addBookToShelfRef,
    addBookToWishlist,
    addBookToWishlistRef,
    addReview,
    history,
    isEditing,
    loading,
    rateBook,
    removeBookFromShelf,
    removeBookFromWishlist,
    removeReview
  } = props;
  const { book, location } = props;
  // const [errors, setErrors] = useState({});
  const [ISBN, setISBN] = useState('ISBN_13');
  const [isOpenRemoveDialog, setIsOpenRemoveDialog] = useState(false);
  const [isOpenReadingState, setIsOpenReadingState] = useState(false);
  const [isOpenRecommendation, setIsOpenRecommendation] = useState(false);
  const [isOpenIncipit, setIsOpenIncipit] = useState(location ? location.pathname.indexOf('/incipit') !== -1 : false);
  const [userBook, setUserBook] = useState(props.userBook);
  const is = useRef(true);

  useEffect(() => {
    setUserBook(props.userBook);
  }, [props.userBook]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (is.current) {
      setIsOpenIncipit(location.pathname.indexOf('/incipit') !== -1);
    }
  }, [location.pathname]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onAddBookToShelf = () => addBookToShelf(book.bid);

  const onAddBookToWishlist = () => addBookToWishlist(book.bid);

  const onRemoveBookFromShelf = () => {
    if (is.current) {
      setIsOpenRemoveDialog(false);
      removeBookFromShelf(book.bid);
    }
  }

  const onRemoveBookFromShelfRequest = () => setIsOpenRemoveDialog(true);

  const onCloseRemoveDialog = () => setIsOpenRemoveDialog(false);

  const onRemoveBookFromWishlist = () => removeBookFromWishlist(book.bid);

  const onRateBook = rate => {
    if (rate.type === 'click') {
      rateBook(book.bid, rate.rating);
      if (is.current) setUserBook({ ...userBook, rating_num: rate.rating });
    }
  };

  const onToggleIncipit = () => {
    if (is.current) setIsOpenIncipit(!isOpenIncipit);

    history.push(location.pathname.indexOf('/incipit') === -1 
    ? `${location.pathname}/incipit` 
    : location.pathname.replace('/incipit', ''), null);
  };

  const onEditing = () => isEditing();

  const onToggleReadingState = () => setIsOpenReadingState(!isOpenReadingState);

  const onToggleSuggest = () => setIsOpenRecommendation(!isOpenRecommendation); 

  const onLock = () => {
    if (book.bid && book.EDIT) {
      const state = book.EDIT.edit;

      if (state) {
        // console.log(`Locking ${id}`);
        bookRef(book.bid).update({ 'EDIT.edit': false }).then(() => {
          openSnackbar('Elemento bloccato', 'success');
        }).catch(err => console.warn(err));
      } else {
        // console.log(`Unlocking ${id}`);
        bookRef(book.bid).update({ 'EDIT.edit': true }).then(() => {
          openSnackbar('Elemento sbloccato', 'success');
        }).catch(err => console.warn(err));
      }
    }
  };

  const onChangeISBN = e => setISBN(e.target.value);

  if (!book && !loading) return <NoMatch title="Libro non trovato" history={history} location={location} />

  const hasBid = book && Boolean(book.bid);
  const isAdmin = hasRole(user, 'admin');
  const isEditor = hasRole(user, 'editor');
  const isLocked = book && !book.EDIT.edit && !isAdmin;
  // const authors = book && <Link to={`/author/${normURL(Object.keys(book.authors)[0])}`}>{Object.keys(book.authors)[0]}</Link>;
  // const bgStyle = book ? { backgroundImage: `url(${book.covers[0]})`, } : {};

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
    
      <div id="BookProfile">
        {/* <div className="content-background">
          <div className="bg" style={bgStyle} />
        </div> */}

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

        <div className="container top">
          <div className="card light main text-center-md">
            <div className="row">
              <div className="col-md-auto col-sm-12" style={{ marginBottom: 15, }}>
                <div
                  tabIndex={0}
                  role="button"
                  className={`text-center ${book ? setFormatClass(book.format) : 'book'}-format ${book && book.incipit ? 'hoverable-items' : ''}`}
                  onClick={book && book.incipit ? onToggleIncipit : null}
                  onKeyDown={book && book.incipit ? onToggleIncipit : null}>
                  <Cover book={book} rating={false} info={false} />
                  {book && book.incipit && <button type="button" className="btn xs rounded flat centered btn-incipit">Leggi incipit</button>}
                </div>
                
                {book && (
                  <>
                    {book.trailerURL && (
                      <button type="button" onClick={() => window.open(book.trailerURL, '_blank')} className="btn xs rounded flat centered btn-trailer">Trailer</button>
                    )}

                    <ShareButtons 
                      className="btn-share-container"
                      hashtags={['biblo', 'libri', 'twittalibro']}
                      cover={book.covers && book.covers[0]}
                      text={`${userBook.bookInShelf ? 'Ho aggiunto alla mia libreria' : userBook.bookInWishlist ? 'Ho aggiunto alla mia lista dei desideri' : 'Consiglio'} il libro "${book.title}" di ${Object.keys(book.authors)[0]}. Leggi un estratto su ${app.name}.`}
                      url={`${app.url}${location.pathname}`}
                      via="BibloSpace"
                    />
                  </>
                )}
              </div>

              <div className="col book-profile">
                <h2 className="title flex">{loading ? <span className="skltn area" /> : book.title}</h2>
                {book && book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
                {loading ? (
                  <div className="skltn rows" />
                ) : book && (
                  <>
                    <div className="info-row">
                      {book.authors && <span className="counter comma">di {Object.keys(book.authors).map(author => 
                        <Link to={`/author/${normURL(author)}`} className="counter" key={author}>{author}</Link> 
                      )}</span>}
                      {book.publisher && <span className="counter hide-sm">editore: {book.publisher}</span>}
                      {isAuthenticated() && hasBid && isEditor && (
                        <>
                          {isAdmin && 
                            <button type="button" onClick={onLock} className={`link counter ${book.EDIT.edit ? 'flat' : 'primary'}`}>
                              <span className="show-sm">{book.EDIT.edit ? icon.lock : icon.lockOpen}</span>
                              <span className="hide-sm">{book.EDIT.edit ? 'Blocca' : 'Sblocca'}</span>
                            </button>
                          }
                          <button type="button" onClick={onEditing} className="link counter" disabled={isLocked} title="Modifica disabilitata">
                            <span className="show-sm">{book.EDIT.edit ? icon.pencil : icon.pencilOff}</span>
                            <span className="hide-sm">Modifica</span>
                          </button>
                          <button type="button" className="link counter" onClick={onToggleSuggest}>
                            <span className="show-sm">{icon.accountHeart}</span>
                            <span className="hide-sm">Consiglia</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="info-row hide-sm">
                      <span className="counter">
                        <Tooltip title="Cambia tipo ISBN">
                          <select className="select-isbn" onChange={onChangeISBN} defaultValue={ISBN} disabled={book.ISBN_10 === 0}>
                            <option value="ISBN_13">ISBN-13</option>
                            <option value="ISBN_10">ISBN-10</option>
                          </select>
                        </Tooltip> <CopyToClipboard text={book[ISBN]}/>
                      </span>
                      {/* book.ISBN_10 !== 0 && <span className="counter">ISBN-10 <CopyToClipboard text={book.ISBN_10}/></span> */}
                      {book.publication && <span className="counter">Pubblicazione {new Date(book.publication).toLocaleDateString()}</span>}
                      {/* book.edition_num !== 0 && <span className="counter">Edizione {book.edition_num}</span> */}
                      {book.format !== 'Audiolibro' && book.pages_num !== 0 && <span className="counter">Pagine {book.pages_num}</span>}
                      {book.format === 'Audiolibro' && book.duration && <span className="counter">Durata {msToTime(book.duration)}</span>}
                      {book.format !== 'Libro' && <span className="counter">Formato {book.format}</span>}
                      {book.genres && book.genres[0] && <span className="counter comma">Gener{book.genres[1] ? 'i' : 'e'} {book.genres.map(genre => <Link to={`/genre/${normURL(genre)}`} className="counter" key={genre}>{genre}</Link> )}</span>}
                      {book.collections && book.collections[0] && <span className="counter comma">Collezion{book.collections[1] ? 'i' : 'e'} {book.collections.map(collection => <Link to={`/collection/${normURL(collection)}`} className="counter" key={collection}>{collection}</Link> )}</span>}
                    </div>

                    <div className="info-row">
                      <Rating labels ratings={{ ratings_num: book ? book.ratings_num : 0, rating_num: book ? book.rating_num : 0 }}/>
                    </div>

                    {isAuthenticated() && (
                      <>
                        <div className="info-row">
                          {userBook.bookInShelf ? (
                            <>
                              <button type="button" className="btn success rounded error-on-hover" onClick={onRemoveBookFromShelfRequest}>
                                <span className="hide-on-hover">{icon.check} libreria</span>
                                <span className="show-on-hover">{icon.close} libreria</span>
                              </button>
                              <button type="button" className="btn rounded" onClick={onToggleReadingState}>
                                <span className="hide-xs">Stato</span> lettura
                              </button>
                            </>
                          ) : (
                            <button type="button" className="btn primary rounded" ref={addBookToShelfRef} disabled={!hasBid || !isEditor} onClick={onAddBookToShelf}>{icon.plus} libreria</button>
                          )}
                          {userBook.bookInWishlist && (
                            <button type="button" className="btn success rounded error-on-hover" onClick={onRemoveBookFromWishlist}>
                              <span className="hide-on-hover">{icon.check} desideri</span>
                              <span className="show-on-hover">{icon.close} desideri</span>
                            </button>
                          )}
                          {(!userBook.bookInWishlist && !userBook.bookInShelf) && (
                            <button type="button" className="btn flat rounded" ref={addBookToWishlistRef} disabled={!hasBid || !isEditor} onClick={onAddBookToWishlist}>{icon.plus} desideri</button>
                          )}
                        </div>
                        {userBook.bookInShelf && (
                          <div className="info-row fadeIn reveal">
                            <div className="user rating">
                              <Rater total={5} onRate={rate => onRateBook(rate)} rating={userBook.rating_num || 0} />
                              {/* <span className="rating-num">{userBook.rating_num || 0}</span> */}
                              <span className="label">Il tuo voto</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {book.description && (
                      <div className="info-row description">
                        <MinifiableText text={book.description} maxChars={700} />
                      </div>
                    )}

                    <div className="info-row bookdetails">
                      <span className="counter">{icon.reader} <b>{abbrNum(book ? book.readers_num : 0)}</b> <span className="hide-sm">Lettori</span></span>
                      <span className="counter">{icon.messageTextOutline} <b>{abbrNum(book ? book.reviews_num : 0)}</b> <span className="hide-sm">Recensioni</span></span>
                      {book && book.pages_num && <span className="counter">{icon.timer} <span className="hide-sm">Lettura</span> <b>{calcReadingTime(book.pages_num)}</b></span>}
                    </div>
                  </>
                )}
              </div>

              {book && book.EDIT && (
                <div className="edit-info">
                  {icon.informationOutline}
                  <div className="show-on-hover">
                    {book.EDIT.lastEdit_num ? (
                      <span>Modificato da <Link to={`/dashboard/${book.EDIT.lastEditByUid}`}>{book.EDIT.lastEditBy}</Link> {timeSince(new Date(book.EDIT.lastEdit_num))}</span> 
                    ) : (
                      <span>Creato da <Link to={`/dashboard/${book.EDIT.createdByUid}`}>{book.EDIT.createdBy}</Link> {timeSince(new Date(book.EDIT.created_num))}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {book && (
          <div className="container">
            {book.bid && (
              <>
                {isAuthenticated() && isEditor && userBook.bookInShelf && (
                  <UserReview
                    addReview={addReview}
                    bid={book.bid}
                    removeReview={removeReview}
                    userBook={userBook}
                  />
                )}
                <Reviews bid={book.bid} />
                {book.collections[0] && (
                  <InView triggerOnce rootMargin="200px">
                    {({ inView, ref }) => (
                      <div className="card dark card-fullwidth-sm" ref={ref} style={{ marginBottom: 0, }}>
                        <BookCollection cid={book.collections[0]} pagination={false} limit={7} inView={inView} scrollable />
                      </div>
                    )}
                  </InView>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isOpenRemoveDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={onCloseRemoveDialog}
        aria-labelledby="remove-dialog-title"
        aria-describedby="remove-dialog-description">
        <DialogTitle id="remove-dialog-title">
          Procedere con la rimozione?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="remove-dialog-description">
            Rimuovendo il libro perderai il voto, la recensione e lo stato di lettura.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="dialog-footer no-gutter">
          <button type="button" className="btn btn-footer flat" onClick={onCloseRemoveDialog}>Annulla</button>
          <button type="button" className="btn btn-footer primary" onClick={onRemoveBookFromShelf}>Procedi</button>
        </DialogActions>
      </Dialog>
    </>
  );
}

BookProfile.propTypes = {
  addReview: funcType.isRequired,
  addBookToShelf: funcType.isRequired,
  addBookToShelfRef: refType.isRequired,
  addBookToWishlist: funcType.isRequired,
  addBookToWishlistRef: refType.isRequired,
  book: bookType,
  history: objectType.isRequired,
  loading: boolType,
  location: locationType,
  removeBookFromShelf: funcType.isRequired,
  removeBookFromWishlist: funcType.isRequired,
  removeReview: funcType.isRequired,
  rateBook: funcType.isRequired,
  isEditing: funcType.isRequired,
  userBook: userBookType
}

BookProfile.defaultProps = {
  book: null,
  loading: null,
  location: null,
  userBook: null
}
 
export default BookProfile;

/* export default class BookProfile extends Component {
	state = {
    book: {
      ...this.props.book,
      bid: (this.props.book && this.props.book.bid) || ''
    },
    // errors: {},
    ISBN: 'ISBN_13',
    isOpenRemoveDialog: false,
    isOpenReadingState: false,
    isOpenRecommendation: false,
    isOpenIncipit: this.props.location ? this.props.location.pathname.indexOf('/incipit') !== -1 : false,
    prevProps: this.props,
    userBook: this.props.userBook
  }

  static propTypes = {
    addReview: funcType.isRequired,
    addBookToShelf: funcType.isRequired,
    addBookToShelfRef: refType.isRequired,
    addBookToWishlist: funcType.isRequired,
    addBookToWishlistRef: refType.isRequired,
    book: bookType,
    history: objectType.isRequired,
    loading: boolType,
    location: locationType,
    openSnackbar: funcType.isRequired,
    removeBookFromShelf: funcType.isRequired,
    removeBookFromWishlist: funcType.isRequired,
    removeReview: funcType.isRequired,
    rateBook: funcType.isRequired,
    isEditing: funcType.isRequired,
    user: userType,
    userBook: userBookType
  }

  static defaultProps = {
    book: null,
    loading: null,
    location: null,
    user: null,
    userBook: null
  }

  static getDerivedStateFromProps(props, state) {
    if (props.book !== state.book) { return { book: props.book }}
    if (props.user !== state.user) { return { user: props.user }}
    if (state.prevProps !== props) {
      if (props.userBook !== state.userBook) { return { prevProps: props, userBook: props.userBook }}
    }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    const { location } = this.props;
    if (location !== prevProps.location) {
      window.scrollTo(0, 0);
      if (prevProps.location.pathname !== location.pathname) {
        if (this._isMounted) {
          this.setState({ isOpenIncipit: location.pathname.indexOf('/incipit') !== -1 });
        }
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onAddBookToShelf = () => this.props.addBookToShelf(this.state.book.bid);

  onAddBookToWishlist = () => this.props.addBookToWishlist(this.state.book.bid);

  onRemoveBookFromShelf = () => {
    if (this._isMounted) {
      this.setState({ isOpenRemoveDialog: false }, () => this.props.removeBookFromShelf(this.state.book.bid));
    }
  }

  onRemoveBookFromShelfRequest = () => this._isMounted && this.setState({ isOpenRemoveDialog: true });

  onCloseRemoveDialog = () => this._isMounted && this.setState({ isOpenRemoveDialog: false });

  onRemoveBookFromWishlist = () => this.props.removeBookFromWishlist(this.state.book.bid);

  onRateBook = rate => {
    if (rate.type === 'click') {
      this.props.rateBook(this.state.book.bid, rate.rating);
      if (this._isMounted) {
        this.setState(prevState => ({
          userBook: {
            ...prevState.userBook,
            rating_num: rate.rating
          }
        }));
      }
    }
  }

  onToggleIncipit = () => {
    const { history, location } = this.props;

    if (this._isMounted) {
      this.setState(prevState => ({ isOpenIncipit: !prevState.isOpenIncipit })); 
    }

    history.push(location.pathname.indexOf('/incipit') === -1 
    ? `${location.pathname}/incipit` 
    : location.pathname.replace('/incipit', ''), null);
  }

  onEditing = () => this.props.isEditing();

  onToggleReadingState = () => {
    if (this._isMounted) {
      this.setState(prevState => ({ isOpenReadingState: !prevState.isOpenReadingState })); 
    }
  }

  onToggleSuggest = () => {
    if (this._isMounted) {
      this.setState(prevState => ({ isOpenRecommendation: !prevState.isOpenRecommendation })); 
    }
  }

  onLock = () => {
    const { openSnackbar } = this.props;
    const { book } = this.state;
    const id = book.bid;
    const state = book.EDIT.edit;

    if (state) {
      // console.log(`Locking ${id}`);
      bookRef(id).update({ 'EDIT.edit': false }).then(() => {
        openSnackbar('Elemento bloccato', 'success');
      }).catch(error => console.warn(error));
    } else {
      // console.log(`Unlocking ${id}`);
      bookRef(id).update({ 'EDIT.edit': true }).then(() => {
        openSnackbar('Elemento sbloccato', 'success');
      }).catch(error => console.warn(error));
    }
  }

  onChangeISBN = e => this.setState({ ISBN: e.target.value });
  
	render() {
    const { book, ISBN, isOpenIncipit, isOpenReadingState, isOpenRecommendation, userBook } = this.state;
    const { addBookToShelfRef, addBookToWishlistRef, addReview, loading, location, removeReview, user } = this.props;
    
    if (loading) return <div aria-hidden="true" className="loader"><CircularProgress /></div>
    
    const hasBid = book && Boolean(book.bid);
    const isAdmin = hasRole(user, 'admin');
    const isEditor = hasRole(user, 'editor');
    const isLocked = book && !book.EDIT.edit && !isAdmin;
    // const authors = book && <Link to={`/author/${normURL(Object.keys(book.authors)[0])}`}>{Object.keys(book.authors)[0]}</Link>;

		return (
      <>
        {isOpenIncipit && 
          <Incipit 
            title={book.title} 
            incipit={book.incipit} 
            copyrightHolder={book.publisher} 
            publication={book.publication} 
            onToggle={this.onToggleIncipit} 
          />
        }
      
        <div id="BookProfile">
          <div className="content-background">
            <div className="bg" style={{ backgroundImage: `url(${book.covers[0]})`, }} />
          </div>

          {isOpenReadingState && 
            <ReadingStateForm
              bid={book.bid}
              readingState={userBook.readingState}
              onToggle={this.onToggleReadingState}
              pages={book.pages_num}
            />
          }

          {isOpenRecommendation && user &&
            <RecommendationForm
              book={book}
              onToggle={this.onToggleSuggest}
            />
          }

          <div className="container top">
            <div className="card light main text-center-md">
              <div className="row">
                <div className="col-md-auto col-sm-12" style={{ marginBottom: 15, }}>
                  {book.incipit ? 
                    <div tabIndex={0} role="button" className={`hoverable-items text-center ${setFormatClass(book.format)}-format`} onClick={this.onToggleIncipit} onKeyDown={this.onToggleIncipit}>
                      <Cover book={book} rating={false} info={false} />
                      <button type="button" className="btn xs rounded flat centered btn-incipit">Leggi incipit</button>
                    </div>
                  :
                    <Cover book={book} rating={false} info={false} />
                  }
                  {book.trailerURL && 
                    <button type="button" onClick={() => window.open(book.trailerURL, '_blank')} className="btn xs rounded flat centered btn-trailer">Trailer</button>
                  }
                  <ShareButtons 
                    className="btn-share-container"
                    hashtags={['biblo', 'libri', 'twittalibro']}
                    cover={book.covers && book.covers[0]}
                    text={`${userBook.bookInShelf ? 'Ho aggiunto alla mia libreria' : userBook.bookInWishlist ? 'Ho aggiunto alla mia lista dei desideri' : 'Consiglio'} il libro "${book.title}" di ${Object.keys(book.authors)[0]}. Leggi un estratto su ${app.name}.`}
                    url={`${app.url}${location.pathname}`}
                    via="BibloSpace"
                  />
                </div>
                <div className="col book-profile">
                  <h2 className="title flex">{book.title}</h2>
                  {book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
                  <div className="info-row">
                  {book.authors && <span className="counter comma">di {Object.keys(book.authors).map(author => 
                    <Link to={`/author/${normURL(author)}`} className="counter" key={author}>{author}</Link> 
                  )}</span>}
                    {book.publisher && <span className="counter hide-sm">editore: {book.publisher}</span>}
                    {isAuthenticated() && hasBid && isEditor && 
                      <>
                        {isAdmin && 
                          <button type="button" onClick={this.onLock} className={`link counter ${book.EDIT.edit ? 'flat' : 'primary'}`}>
                            <span className="show-sm">{book.EDIT.edit ? icon.lock : icon.lockOpen}</span>
                            <span className="hide-sm">{book.EDIT.edit ? 'Blocca' : 'Sblocca'}</span>
                          </button>
                        }
                        <button type="button" onClick={this.onEditing} className="link counter" disabled={isLocked} title="Modifica disabilitata">
                          <span className="show-sm">{book.EDIT.edit ? icon.pencil : icon.pencilOff}</span>
                          <span className="hide-sm">Modifica</span>
                        </button>
                        <button type="button" className="link counter" onClick={this.onToggleSuggest}>
                          <span className="show-sm">{icon.accountHeart}</span>
                          <span className="hide-sm">Consiglia</span>
                        </button>
                      </>
                    }
                  </div>
                  <div className="info-row hide-sm">
                    <span className="counter">
                      <Tooltip title="Cambia tipo ISBN">
                        <select className="select-isbn" onChange={this.onChangeISBN} defaultValue={ISBN} disabled={book.ISBN_10 === 0}>
                          <option value="ISBN_13">ISBN-13</option>
                          <option value="ISBN_10">ISBN-10</option>
                        </select>
                      </Tooltip> <CopyToClipboard text={book[ISBN]}/>
                    </span>
                    {
                      // book.ISBN_10 !== 0 && <span className="counter">ISBN-10 <CopyToClipboard text={book.ISBN_10}/></span>
                    }
                    {book.publication && <span className="counter">Pubblicazione {new Date(book.publication).toLocaleDateString()}</span>}
                    {
                      // book.edition_num !== 0 && <span className="counter">Edizione {book.edition_num}</span>
                    }
                    {book.format !== 'Audiolibro' && book.pages_num !== 0 && <span className="counter">Pagine {book.pages_num}</span>}
                    {book.format === 'Audiolibro' && book.duration && <span className="counter">Durata {msToTime(book.duration)}</span>}
                    {book.format !== 'Libro' && <span className="counter">Formato {book.format}</span>}
                    {book.genres && book.genres[0] && <span className="counter comma">Gener{book.genres[1] ? 'i' : 'e'} {book.genres.map(genre => <Link to={`/genre/${normURL(genre)}`} className="counter" key={genre}>{genre}</Link> )}</span>}
                    {book.collections && book.collections[0] && <span className="counter comma">Collezion{book.collections[1] ? 'i' : 'e'} {book.collections.map(collection => <Link to={`/collection/${normURL(collection)}`} className="counter" key={collection}>{collection}</Link> )}</span>}
                  </div>

                  <div className="info-row">
                    <Rating labels ratings={{ratings_num: book.ratings_num, rating_num: book.rating_num}}/>
                  </div>

                  {isAuthenticated() &&
                    <>
                      <div className="info-row">
                        {userBook.bookInShelf ? 
                          <>
                            <button type="button" className="btn success rounded error-on-hover" onClick={this.onRemoveBookFromShelfRequest}>
                              <span className="hide-on-hover">{icon.check} libreria</span>
                              <span className="show-on-hover">{icon.close} libreria</span>
                            </button>
                            <button type="button" className="btn rounded" onClick={this.onToggleReadingState}>
                              <span className="hide-xs">Stato</span> lettura
                            </button>
                          </>
                        :
                          <button type="button" className="btn primary rounded" ref={addBookToShelfRef} disabled={!hasBid || !isEditor} onClick={this.onAddBookToShelf}>{icon.plus} libreria</button>
                        }
                        {userBook.bookInWishlist && 
                          <button type="button" className="btn success rounded error-on-hover" onClick={this.onRemoveBookFromWishlist}>
                            <span className="hide-on-hover">{icon.check} desideri</span>
                            <span className="show-on-hover">{icon.close} desideri</span>
                          </button>
                        }
                        {(!userBook.bookInWishlist && !userBook.bookInShelf) &&
                          <button type="button" className="btn flat rounded" ref={addBookToWishlistRef} disabled={!hasBid || !isEditor} onClick={this.onAddBookToWishlist}>{icon.plus} desideri</button>
                        }
                      </div>
                      {userBook.bookInShelf &&
                        <div className="info-row fadeIn reveal">
                          <div className="user rating">
                            <Rater total={5} onRate={rate => this.onRateBook(rate)} rating={userBook.rating_num || 0} />
                            {
                              // <span className="rating-num">{userBook.rating_num || 0}</span>
                            }
                            <span className="label">Il tuo voto</span>
                          </div>
                        </div>
                      }
                    </>
                  }

                  {book.description && 
                    <div className="info-row description">
                      <MinifiableText text={book.description} maxChars={700} />
                    </div>
                  }

                  <div className="info-row bookdetails">
                    <span className="counter">{icon.reader} <b>{abbrNum(book.readers_num)}</b> <span className="hide-sm">Lettori</span></span>
                    <span className="counter">{icon.messageTextOutline} <b>{abbrNum(book.reviews_num)}</b> <span className="hide-sm">Recensioni</span></span>
                    {book.pages_num && <span className="counter">{icon.timer} <span className="hide-sm">Lettura</span> <b>{calcReadingTime(book.pages_num)}</b></span>}
                  </div>
                </div>
                {book.EDIT &&
                  <div className="edit-info">
                    {icon.informationOutline}
                    <div className="show-on-hover">
                      {book.EDIT.lastEdit_num ? 
                        <span>Modificato da <Link to={`/dashboard/${book.EDIT.lastEditByUid}`}>{book.EDIT.lastEditBy}</Link> {timeSince(new Date(book.EDIT.lastEdit_num))}</span> 
                      : 
                        <span>Creato da <Link to={`/dashboard/${book.EDIT.createdByUid}`}>{book.EDIT.createdBy}</Link> {timeSince(new Date(book.EDIT.created_num))}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div className="container">
            {book.bid &&
              <>
                {isAuthenticated() && isEditor && userBook.bookInShelf &&
                  <UserReview
                    addReview={addReview}
                    bid={book.bid}
                    removeReview={removeReview}
                    userBook={userBook}
                  />
                }
                <Reviews bid={book.bid} />
                {book.collections[0] && 
                  <InView triggerOnce rootMargin="200px">
                    {({ inView, ref }) => 
                      <div className="card dark card-fullwidth-sm" ref={ref} style={{ marginBottom: 0, }}>
                        <BookCollection cid={book.collections[0]} pagination={false} limit={7} inView={inView} scrollable />
                      </div>
                    }
                  </InView>
                }
              </>
            }
          </div>
        </div>

        <Dialog
          open={this.state.isOpenRemoveDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.onCloseRemoveDialog}
          aria-labelledby="remove-dialog-title"
          aria-describedby="remove-dialog-description">
          <DialogTitle id="remove-dialog-title">
            Procedere con la rimozione?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="remove-dialog-description">
              Rimuovendo il libro perderai il voto, la recensione e lo stato di lettura.
            </DialogContentText>
          </DialogContent>
          <DialogActions className="dialog-footer no-gutter">
            <button type="button" className="btn btn-footer flat" onClick={this.onCloseRemoveDialog}>Annulla</button>
            <button type="button" className="btn btn-footer primary" onClick={this.onRemoveBookFromShelf}>Procedi</button>
          </DialogActions>
        </Dialog>
      </>
		);
	}
} */