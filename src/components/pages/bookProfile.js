import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import React from 'react';
import Rater from 'react-rater';
import Link from 'react-router-dom/Link';
import { isAuthenticated } from '../../config/firebase';
import { icon } from '../../config/icons';
import { abbrNum, calcReadingTime /* , joinObj */, timeSince } from '../../config/shared';
import { funcType, userBookType, userType } from '../../config/types';
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
    user: this.props.user || {},
    userBook: this.props.userBook,
    errors: {},
    isOpenRemoveDialog: false,
    isOpenReadingState: false,
    isOpenIncipit: false,
    prevProps: this.props
  }

  static propTypes = {
    addBookToShelf: funcType.isRequired,
    addBookToWishlist: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    removeBookFromShelf: funcType.isRequired,
    removeBookFromWishlist: funcType.isRequired,
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

  onAddBookToShelf = () => this.props.addBookToShelf(this.state.book.bid);

  onAddBookToWishlist = () => this.props.addBookToWishlist(this.state.book.bid);

  onRemoveBookFromShelf = () => {
    this.setState({ isOpenRemoveDialog: false });
    this.props.removeBookFromShelf(this.state.book.bid);
  }

  onRemoveBookFromShelfRequest = () => this.setState({ isOpenRemoveDialog: true });

  onCloseRemoveDialog = () => this.setState({ isOpenRemoveDialog: false });

  onRemoveBookFromWishlist = () => this.props.removeBookFromWishlist(this.state.book.bid);

  onRateBook = rate => {
    if(rate.type === 'click') {
      this.props.rateBook(this.state.book.bid, rate.rating);
      this.setState({
        userBook: {
          ...this.state.userBook,
          rating_num: rate.rating
        }
      });
    }
  }

  onToggleIncipit = () => this.setState(prevState => ({ isOpenIncipit: !prevState.isOpenIncipit })); 

  onEditing = () => this.props.isEditing();

  onToggleReadingState = () => this.setState(prevState => ({ isOpenReadingState: !prevState.isOpenReadingState })); 
  
	render() {
    const { book, isOpenIncipit, isOpenReadingState, user, userBook } = this.state;
    const { loading, openSnackbar } = this.props;
    //const isAdmin = () => user && user.roles && user.roles.admin === true;
    const isEditor = () => user && user.roles && user.roles.editor === true;
    const hasBid = () => book && book.bid;
    const authors = book && <Link to={`/author/${Object.keys(book.authors)[0]}`}>{Object.keys(book.authors)[0]}</Link>;

    if (loading) return <div className="loader"><CircularProgress /></div>

		return (
      <React.Fragment>
        {isOpenIncipit && <Incipit title={book.title} incipit={book.incipit} onToggle={this.onToggleIncipit} />}
      
        <div id="BookProfileComponent">
          <div className="content-background"><div className="bg" style={{backgroundImage: `url(${book.covers[0]})`}}></div></div>

          {isOpenReadingState && <ReadingStateForm bid={book.bid} readingState={userBook.readingState} onToggle={this.onToggleReadingState} />}

          <div className="container top">
            <div className="card main text-center-md">
              <div className="row">
                <div className="col-md-auto col-sm-12" style={{marginBottom: 15}}>
                  {book.incipit ? 
                    <div role="button" className="hoverable-items" onClick={this.onToggleIncipit}>
                      <Cover book={book} rating={false} info={false} />
                      <button className="btn xs centered flat" style={{'marginTop': '10px'}}>Leggi incipit</button>
                    </div>
                  :
                    <Cover book={book} rating={false} info={false} />
                  }
                </div>
                <div className="col book-profile">
                  <h2 className="title">{book.title}</h2>
                  {book.subtitle && <h3 className="subtitle">{book.subtitle}</h3>}
                  <div className="info-row">
                    {book.authors && <span className="counter">di {authors}</span>}
                    {book.publisher && <span className="counter hide-sm">editore: {book.publisher}</span>}
                    {isAuthenticated() && isEditor() && book.bid && <button className="btn sm flat counter" onClick={this.onEditing}>{icon.pencil()} Modifica</button>}
                  </div>
                  <div className="info-row hide-sm">
                    <span className="counter">ISBN-13: <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_13}/></span>
                    {(book.ISBN_10 !== 0) && <span className="counter">ISBN-10: <CopyToClipboard openSnackbar={openSnackbar} text={book.ISBN_10}/></span>}
                    {book.publication && <span className="counter">Pubblicazione: {new Date(book.publication).toLocaleDateString()}</span>}
                    {/* (book.edition_num !== 0) && <span className="counter">Edizione: {book.edition_num}</span> */}
                    {(book.pages_num !== 0) && <span className="counter">Pagine: {book.pages_num}</span>}
                    {book.format !== 'Libro' && <span className="counter">Formato: {book.format}</span>}
                    {book.genres && book.genres[0] && <span className="counter">Gener{book.genres[1] ? 'i' : 'e'}: {book.genres.join(", ")}</span>}
                  </div>

                  <div className="info-row">
                    <Rating labels={true} ratings={{ratings_num: book.ratings_num, rating_num: book.rating_num}}/>
                  </div>

                  {isAuthenticated() &&
                    <React.Fragment>
                      <div className="info-row">
                        {userBook.bookInShelf ? 
                          <React.Fragment>
                            <button className="btn success error-on-hover" onClick={this.onRemoveBookFromShelfRequest}>
                              <span className="hide-on-hover">{icon.check()} libreria</span>
                              <span className="show-on-hover">{icon.close()} libreria</span>
                            </button>
                            <button className="btn" onClick={this.onToggleReadingState}><span className="hide-xs">Stato</span> lettura</button>
                          </React.Fragment>
                        :
                          <button className="btn primary" disabled={!hasBid()} onClick={this.onAddBookToShelf}>{icon.plus()} libreria</button>
                        }
                        {userBook.bookInWishlist && 
                          <button className="btn success error-on-hover" onClick={this.onRemoveBookFromWishlist}>
                            <span className="hide-on-hover">{icon.check()} desideri</span>
                            <span className="show-on-hover">{icon.close()} desideri</span>
                          </button>
                        }
                        {(!userBook.bookInWishlist && !userBook.bookInShelf) &&
                          <button className="btn flat" disabled={!hasBid()} onClick={this.onAddBookToWishlist}>{icon.plus()} desideri</button>
                        }
                      </div>
                      {userBook.bookInShelf &&
                        <div className="info-row">
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

            {book.bid &&
              <React.Fragment>
                {isAuthenticated() && isEditor() && userBook.bookInShelf &&
                  <UserReview bid={book.bid} bookReviews_num={book.reviews_num} user={user} userBook={userBook} /> 
                }
                <Reviews bid={book.bid} />
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
          <DialogActions>
            <button className="btn flat" onClick={this.onCloseRemoveDialog}>Annulla</button>
            <button className="btn primary" onClick={this.onRemoveBookFromShelf}>Procedi</button>
          </DialogActions>
        </Dialog>

      </React.Fragment>
		);
	}
}

const Transition = props => <Slide direction="up" {...props} />;