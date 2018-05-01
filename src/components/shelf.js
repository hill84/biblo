import React from 'react';
import { Link } from 'react-router-dom';
import { bookRef, uid, userBooksRef } from '../config/firebase';
import { stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow } from './skeletons';

export default class Shelf extends React.Component {
    state = {
        luid: uid,
        uid: this.props.uid,
        shelfBooks: [],
        wishlistBooks: [],
        userBooks: [],
        loading: true,
        errors: {},
        authError: ''
    }

    static propTypes = {
        uid: stringType.isRequired
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (uid !== prevState.luid) { return { luid: uid }; }
        if (nextProps.uid !== prevState.uid) { return { uid: nextProps.uid }; }
        return null;
    }
    
    componentDidMount() {
        this.getBooks(this.props.uid);
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(this.state.uid !== prevState.uid){
            this.getBooks(this.state.uid);
        }
    }

    getBooks = uid => {
        userBooksRef(uid).onSnapshot(snap => { 
            this.setState({ loading: true });  
            if (!snap.empty) {
                //console.log(snap);
                let snapUserBooks = [];
                let snapShelfBooks = [];
                let snapWishlistBooks = [];
                snap.forEach(userBook => {
                    //console.log(userBook.id);
                    snapUserBooks.push(userBook.data());
                    this.setState({ userBooks: snapUserBooks });
                    bookRef(userBook.id).get().then(book => {
                        if (book.exists) {
                            if (userBook.data().bookInShelf) {
                                //console.log('book in shelf');
                                snapShelfBooks.push(book.data());
                            } else {
                                //console.log('book in wishlist');
                                snapWishlistBooks.push(book.data());
                            }
                        } else { console.warn("book doesn't exist"); }
                        this.setState({ 
                            shelfBooks: snapShelfBooks, 
                            wishlistBooks: snapWishlistBooks, 
                            loading: false 
                        });
                    });
                });
            } else {
                //console.log('no books');
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
        const { luid, loading, shelfBooks, uid, wishlistBooks } = this.state;
        const isOwner = luid === uid;
        let shelfCovers = shelfBooks && shelfBooks.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={index} /></Link> );
        let wishlistCovers = wishlistBooks && wishlistBooks.map((book, index) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={index} rating={false} /></Link> );

        return (
            <div ref="shelfComponent">
                <div className="shelf">
                    
                    <div className="collection hoverable-items">
                        {loading ? skltn_shelfRow :
                            <div className="shelf-row">
                                { isOwner &&
                                    <Link to="/books/add">
                                        <div className="book empty">
                                            <div className="cover">+</div>
                                            <div className="info"><b className="title">Aggiungi libro</b></div>
                                        </div>
                                    </Link>
                                }
                                {shelfCovers}
                            </div>
                        }
                    </div>
                    
                    {wishlistCovers[0] && 
                        <div className="collection hoverable-items">
                            <hr className="line" />
                            <h2 className="info-row centered">Lista desideri</h2>
                            <div className="shelf-row">{wishlistCovers}</div>
                        </div>
                    }
                </div>
                {/* <div className="row justify-content-center">
                    {!shelfCovers[0] && !wishlistCovers[0] && <div className="placeholder">Empy state</div>}
                    <Link to="/books/add" className="btn primary">Aggiungi libro</Link>
                </div> */}
            </div>
        );
    }
}