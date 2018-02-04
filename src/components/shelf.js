import React from 'react';
import { Link } from 'react-router-dom';
import { UserBooksRef } from '../config/firebase';
import { stringType, userType } from '../config/types';
import Cover from './cover';

export default class Shelf extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shelf: null,
            loading: false,
            errors: {},
            authError: ''
        }
    }

    componentDidMount(props) {
        UserBooksRef(this.props.uid).onSnapshot(snap => {
            //console.log(snap);
            if (!snap.empty) {
                var books = [];
                snap.forEach(doc => {
                    books.push(doc.data());
                });
                //console.log(books);
                this.setState({
                    shelf: books
                });
                //console.log(this.state.shelf);
            } else {
                //console.log('no books');
                this.setState({
                    shelf: null
                });
            }
        });
    }

    render(props) {
        const { user } = this.props;
        const { shelf } = this.state;
        let shelfBooks;
        if (shelf) {
            shelfBooks = shelf.map(book =>
                <Cover key={book.bid} book={book} />
            );
        }

        return (
            <div ref="shelfComponent">
                <div className="card bottompend">
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            {user.stats.shelf_num > 0 ? 
                                <div className="shelf">
                                    <div className="info-row">La libreria di {user.displayName}</div>
                                    <div>{shelfBooks}</div>
                                </div>
                            : 
                                <Link to="/books/add" className="btn primary">Aggiungi libro</Link>
                            }
                        </div>
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