import React from 'react';
import { Link } from 'react-router-dom';
import { bookRef, userBooksRef } from '../config/firebase';
import { stringType, userType } from '../config/types';
import Cover from './cover';

export default class Shelf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            books: null,
            userBooks: null,
            loading: false,
            errors: {},
            authError: ''
        }
    }

    componentDidMount(props) {
        userBooksRef(this.props.uid).onSnapshot(snap => {   
            if (!snap.empty) {
                //console.log(snap);
                var snapUserBooks = [];
                var snapBooks = [];
                snap.forEach(userBook => {
                    console.log(userBook.id);
                    //console.log(userBook.data());
                    snapUserBooks.push(userBook.data());
                    bookRef(userBook.id).get().then(book => {
                        if (book.exists) {
                            console.log('book exists', book.data());
                            snapBooks.push(book.data());
                            this.setState({
                                books: snapBooks,
                                userBooks: snapUserBooks
                            });
                        } else console.log("book doesn't esist");
                    });
                });
                //console.log(this.state.books);
            } else {
                console.log('no books');
                this.setState({
                    books: null,
                    userBooks: null
                });
            }
        });
    }

    render(props) {
        const { user } = this.props;
        const { books } = this.state;
        let covers = books && books.map(book => <Cover key={book.bid} book={book} /> );

        return (
            <div ref="shelfComponent">
                <div className="card bottompend">
                    <div className="row justify-content-center shelf">
                        {covers && 
                            <div className="col">
                                <div className="info-row centered">La libreria di {user.displayName}</div>
                                <div className="shelf-row">{covers}</div>
                            </div>
                        }
                    </div>
                    <div className="row justify-content-center">
                        <Link to="/books/add" className="btn primary">Aggiungi libro</Link>
                    </div>

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