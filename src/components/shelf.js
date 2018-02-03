import React from 'react';
import { Link } from 'react-router-dom';
import { auth, shelfRef } from '../config/firebase';
import { stringType, userType } from '../config/types';

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

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            if (user) {
                shelfRef(user.uid).get().then(doc => {
                    if (doc.exists) {
                        this.setState({
                            shelf: doc.data()
                        });
                    }
                });
            }
        });
    }

    render(props) {
        const { user, uid } = this.props;

        return (
            <div ref="shelfComponent">
                <div className="card bottompend">
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            {user.stats.shelf_num > 0 ? 
                                <p>La libreria di {uid}</p> 
                            : 
                                <Link to="/books/add" className="btn primary">Aggiungi libro</Link>
                            }
                        </div>
                    </div>

                    <div className="info-row">
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