import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import React from 'react';
import { InView } from 'react-intersection-observer';
import Rater from 'react-rater';
import { Link } from 'react-router-dom';
import { Composer, SayButton } from 'react-say';
import { bookRef, isAuthenticated } from '../../config/firebase';
import { icon } from '../../config/icons';
import { abbrNum, calcReadingTime, hasRole, msToTime, normURL, timeSince } from '../../config/shared';
import { funcType, objectType, userBookType, userType } from '../../config/types';
import BookCollection from '../bookCollection';
import CopyToClipboard from '../copyToClipboard';
import Cover from '../cover';
import ReadingStateForm from '../forms/readingStateForm';
import Incipit from '../incipit';
import MinifiableText from '../minifiableText';
import Rating from '../rating';
import Reviews from '../reviews';
import UserReview from '../userReview';

export default class BookProfile extends React.Component {
	state = {
    book: {
      ...this.props.book,
      bid: (this.props.book && this.props.book.bid) || ''
    },
    errors: {},
    isOpenRemoveDialog: false,
    isOpenReadingState: false,
    isOpenIncipit: this.props.location ? this.props.location.pathname.indexOf('/incipit') !== -1 : false,
    prevProps: this.props,
    user: this.props.user || {},
    userBook: this.props.userBook
  }

  static propTypes = {
    addReview: funcType.isRequired,
    addBookToShelf: funcType.isRequired,
    addBookToWishlist: funcType.isRequired,
    history: objectType.isRequired,
    location: objectType.isRequired,
    openSnackbar: funcType.isRequired,
    removeBookFromShelf: funcType.isRequired,
    removeBookFromWishlist: funcType.isRequired,
    removeReview: funcType.isRequired,
    rateBook: funcType.isRequired,
    isEditing: funcType.isRequired,
    user: userType,
    userBook: userBookType
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

  componentWillUnmount() {
    this._isMounted = false;
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
        this.setState({
          userBook: {
            ...this.state.userBook,
            rating_num: rate.rating
          }
        });
      }
    }
  }

  onToggleIncipit = () => {
    const { history, location } = this.props;
    
    history.push(location.pathname.indexOf('/incipit') === -1 
    ? `${location.pathname}/incipit` 
    : location.pathname.replace('/incipit', ''), null);

    if (this._isMounted) {
      this.setState(prevState => ({ isOpenIncipit: !prevState.isOpenIncipit })); 
    }
  }

  onEditing = () => this.props.isEditing();

  onToggleReadingState = () => {
    if (this._isMounted) {
      this.setState(prevState => ({ isOpenReadingState: !prevState.isOpenReadingState })); 
    }
  }

  setFormatClass = format => {
    switch (format) {
      case 'Audiolibro': return 'audio';
      case 'Rivista': return 'magazine';
      case 'Ebook': return 'ebook';
      default: return 'book';
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
  
	render() {
    const { book, isOpenIncipit, isOpenReadingState, user, userBook } = this.state;
    const { addReview, loading, openSnackbar, removeReview } = this.props;
    
    if (loading) return <div aria-hidden="true" className="loader"><CircularProgress /></div>
    
    const hasBid = book && Boolean(book.bid);
    const isAdmin = hasRole(user, 'admin');
    const isEditor = hasRole(user, 'editor');
    const isLocked = book && !book.EDIT.edit && !isAdmin;
    // const authors = book && <Link to={`/author/${normURL(Object.keys(book.authors)[0])}`}>{Object.keys(book.authors)[0]}</Link>;

		return (
      <React.Fragment><Composer>
        {isOpenIncipit && 
          <Incipit 
            title={book.title} 
            incipit={book.incipit} 
            copyrightHolder={book.publisher} 
            publication={book.publication} 
            onToggle={this.onToggleIncipit} 
          />
        }
      
        <div id="BookProfileComponent">
          <div className="content-background">
            <div className="bg" style={{ backgroundImage: `url(${book.covers[0]})` }} />
          </div>

          {isOpenReadingState && 
            <ReadingStateForm 
              bid={book.bid} 
              readingState={userBook.readingState} 
              onToggle={this.onToggleReadingState} 
              openSnackbar={openSnackbar} 
            />
          }

          <div className="container top">
            <div className="card light main text-center-md">
              <div className="row">
                <div className="col-md-auto col-sm-12" style={{ marginBottom: 15 }}>
                  {book.incipit ? 
                    <div role="button" className={`hoverable-items text-center ${this.setFormatClass(book.format)}-format`} onClick={this.onToggleIncipit}>
                      <Cover book={book} rating={false} info={false} />
                      <button type="button" className="btn xs rounded flat centered btn-incipit">Leggi incipit</button>
                    </div>
                  :
                    <Cover book={book} rating={false} info={false} />
                  }
                  {book.trailerURL && 
                    <button onClick={() => window.open(book.trailerURL, '_blank')} className="btn xs rounded flat centered btn-trailer">Trailer</button>
                  }
                </div>
                <div className="col book-profile">
                  <h2 className="title flex">
                    {book.title}&nbsp;
                    {book.description && 
                      <SayButton speak={book.description}>
                        <div className="btn rounded icon flat audio">{icon.voice()}</div>
                      </SayButton>
                    }
                  </h2>
                  {book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
                  <div className="info-row">
                  {book.authors && <span className="counter comma">di {Object.keys(book.authors).map(author => 
                    <Link to={`/author/${normURL(author)}`} className="counter" key={author}>{author}</Link> 
                  )}</span>}
                    {book.publisher && <span className="counter hide-sm">editore: {book.publisher}</span>}
                    {isAuthenticated() && hasBid && isEditor && 
                      <React.Fragment>
                        <button type="button" onClick={this.onEditing} className="btn sm rounded flat counter" disabled={isLocked} title="Modifica disabilitata">
                          {book.EDIT.edit ? icon.pencil() : icon.pencilOff()} Modifica
                        </button>
                        {isAdmin && 
                          <button type="button" onClick={this.onLock} className={`btn sm rounded counter ${book.EDIT.edit ? 'flat' : 'secondary'}`}>{book.EDIT.edit ? 'Blocca' : 'Sblocca'}</button>
                        }
                      </React.Fragment>
                    }
                  </div>
                  <div className="info-row hide-sm">
                    <span className="counter">ISBN-13: <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_13}/></span>
                    {book.ISBN_10 !== 0 && <span className="counter">ISBN-10: <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_10}/></span>}
                    {book.publication && <span className="counter">Pubblicazione: {new Date(book.publication).toLocaleDateString()}</span>}
                    {/* book.edition_num !== 0 && <span className="counter">Edizione: {book.edition_num}</span> */}
                    {book.format !== 'Audiolibro' && book.pages_num !== 0 && <span className="counter">Pagine: {book.pages_num}</span>}
                    {book.format === 'Audiolibro' && book.duration && <span className="counter">Durata: {msToTime(book.duration)}</span>}
                    {book.format !== 'Libro' && <span className="counter">Formato: {book.format}</span>}
                    {book.genres && book.genres[0] && <span className="counter comma">Gener{book.genres[1] ? 'i' : 'e'}: {book.genres.map(genre => <Link to={`/genre/${normURL(genre)}`} className="counter" key={genre}>{genre}</Link> )}</span>}
                    {book.collections && book.collections[0] && <span className="counter comma">Collezion{book.collections[1] ? 'i' : 'e'}: {book.collections.map(collection => <Link to={`/collection/${normURL(collection)}`} className="counter" key={collection}>{collection}</Link> )}</span>}
                  </div>

                  <div className="info-row">
                    <Rating labels ratings={{ratings_num: book.ratings_num, rating_num: book.rating_num}}/>
                  </div>

                  {isAuthenticated() &&
                    <React.Fragment>
                      <div className="info-row">
                        {userBook.bookInShelf ? 
                          <React.Fragment>
                            <button type="button" className="btn success rounded error-on-hover" onClick={this.onRemoveBookFromShelfRequest}>
                              <span className="hide-on-hover">{icon.check()} libreria</span>
                              <span className="show-on-hover">{icon.close()} libreria</span>
                            </button>
                            <button type="button" className="btn rounded" onClick={this.onToggleReadingState}>
                              <span className="hide-xs">Stato</span> lettura
                            </button>
                          </React.Fragment>
                        :
                          <button type="button" className="btn primary rounded" disabled={!hasBid || !isEditor} onClick={this.onAddBookToShelf}>{icon.plus()} libreria</button>
                        }
                        {userBook.bookInWishlist && 
                          <button type="button" className="btn success rounded error-on-hover" onClick={this.onRemoveBookFromWishlist}>
                            <span className="hide-on-hover">{icon.check()} desideri</span>
                            <span className="show-on-hover">{icon.close()} desideri</span>
                          </button>
                        }
                        {(!userBook.bookInWishlist && !userBook.bookInShelf) &&
                          <button type="button" className="btn flat rounded" disabled={!hasBid || !isEditor} onClick={this.onAddBookToWishlist}>{icon.plus()} desideri</button>
                        }
                      </div>
                      {userBook.bookInShelf &&
                        <div className="info-row fadeIn reveal">
                          <div className="user rating">
                            <Rater total={5} onRate={rate => this.onRateBook(rate)} rating={userBook.rating_num || 0} />
                            {/* <span className="rating-num">{userBook.rating_num || 0}</span> */}
                            <span className="label">Il tuo voto</span>
                          </div>
                        </div>
                      }
                    </React.Fragment>
                  }

                  {book.description && 
                    <div className="info-row description">
                      <MinifiableText text={book.description} maxChars={700} />
                    </div>
                  }

                  <div className="info-row bookdetails">
                    <span className="counter">{icon.reader()} <span className="hide-sm">Lettori:</span> {abbrNum(book.readers_num)}</span>
                    <span className="counter">{icon.messageTextOutline()} <span className="hide-sm">Recensioni:</span> {abbrNum(book.reviews_num)}</span>
                    {book.pages_num && <span className="counter">{icon.timer()} <span className="hide-sm">Lettura:</span>  {calcReadingTime(book.pages_num)}</span>}
                  </div>
                </div>
                {book.EDIT &&
                  <div className="edit-info">
                    {icon.informationOutline()}
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
              <React.Fragment>
                {isAuthenticated() && isEditor && userBook.bookInShelf &&
                  <UserReview 
                    addReview={addReview} 
                    bid={book.bid} 
                    bookReviews_num={book.reviews_num} 
                    openSnackbar={openSnackbar}
                    removeReview={removeReview} 
                    user={user} 
                    userBook={userBook} 
                  /> 
                }
                <Reviews bid={book.bid} user={user} />
                {book.collections[0] && 
                  <InView triggerOnce rootMargin="200px">
                    {({ inView, ref }) => 
                      <div className="card dark card-fullwidth-sm" ref={ref} style={{ marginBottom: 0 }}>
                        <BookCollection cid={book.collections[0]} openSnackbar={openSnackbar} pagination={false} limit={7} inView={inView} scrollable />
                      </div>
                    }
                  </InView>
                }
              </React.Fragment>
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
        </Composer>
      </React.Fragment>
		);
	}
}

const Transition = React.forwardRef((props, ref) => <Grow {...props} ref={ref} /> );