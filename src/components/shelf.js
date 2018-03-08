import React from 'react';
import { skltn_shelfRow }from './skeletons'
import { Link } from 'react-router-dom';
import { bookRef, userBooksRef } from '../config/firebase';
import { stringType, userType } from '../config/types';
import Cover from './cover';

export default class Shelf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shelfBooks: [],
            wishlistBooks: [],
            userBooks: [],
            loading: false,
            errors: {},
            authError: ''
        }
    }

    componentDidMount(props) {
        userBooksRef(this.props.uid).onSnapshot(snap => { 
            this.setState({ loading: true });  
            if (!snap.empty) {
                //console.log(snap);
                let snapUserBooks = [];
                let snapShelfBooks = [];
                let snapWishlistBooks = [];
                snap.forEach(userBook => {
                    //console.log(userBook.id);
                    //console.log(userBook.data());
                    snapUserBooks.push(userBook.data());
                    this.setState({
                        userBooks: snapUserBooks
                    });
                    
                    bookRef(userBook.id).get().then(book => {
                        if (book.exists) {
                            //console.log('book exists', book.data());
                            if (userBook.data().bookInShelf) {
                                //console.log('book in shelf');
                                snapShelfBooks.push(book.data());
                                this.setState({ shelfBooks: snapShelfBooks });
                            } else {
                                //console.log('book in wishlist');
                                snapWishlistBooks.push(book.data());
                                this.setState({ wishlistBooks: snapWishlistBooks });
                            }
                        } else console.log("book doesn't exist");
                        this.setState({ loading: false });
                    });
                });
            } else {
                console.log('no books');
                this.setState({
                    shelfBooks: [],
                    wishlistBooks: [],
                    userBooks: [],
                    loading: false
                });
            }
        });
    }

    render(props) {
        const { user } = this.props;
        const { loading, shelfBooks, wishlistBooks } = this.state;
        let shelfCovers = shelfBooks && shelfBooks.map(book => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} /></Link> );
        let wishlistCovers = wishlistBooks && wishlistBooks.map(book => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} /></Link> );

        return (
            <div ref="shelfComponent">
                <div className="card bottompend">
                    <div className=" justify-content-center shelf">
                        
                        <div className="collection hoverable-items">
                            {loading ? 
                                skltn_shelfRow 
                            :
                                <div className="shelf-row">
                                    <Link to="/books/add">
                                        <div className="book empty">
                                            <div className="cover"><div className="overlay"></div></div>
                                            <div className="info"><b className="title">Aggiungi libro</b></div>
                                        </div>
                                    </Link>
                                    {shelfCovers}
                                </div>
                            }
                        </div>
                        
                        {wishlistCovers[0] && 
                            <div className="collection hoverable-items">
                                <h2 className="info-row centered">Lista desideri</h2>
                                <div className="shelf-row">{wishlistCovers}</div>
                            </div>
                        }
                    </div>
                    {/* <div className="row justify-content-center">
                        {!shelfCovers[0] && !wishlistCovers[0] && <div className="placeholder">Empy state</div>}
                        <Link to="/books/add" className="btn primary">Aggiungi libro</Link>
                    </div> */}

                    <div className="info-row footer centered">
                        <span className="counter">Libri: <b>{user.stats.shelf_num}</b></span>
                        <span className="counter">Wishlist: <b>{user.stats.wishlist_num}</b></span>
                        <span className="counter">Valutazioni: <b>{user.stats.ratings_num}</b></span>
                        <span className="counter">Recensioni: <b>{user.stats.reviews_num}</b></span>
                    </div>
                </div>
            </div>
        );
    }
}

Shelf.propTypes = {
    uid: stringType.isRequired,
    user: userType.isRequired
}