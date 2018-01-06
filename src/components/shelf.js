import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { auth, shelfRef } from '../config/firebase';

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
                shelfRef(user.uid).on('value', snap => {
                    this.setState({
                        shelf: snap.val()
                    });
                });
            }
        });
    }

    render(props) {
        const { user, uid } = this.props;

        return (
            <div id="shelfComponent">
                <div className="card bottompend">
                    <div className="row justify-content-center">
                        <div className="col-auto">
                            {user.shelf_num > 0 ? <p>La libreria di {uid}</p> : <Link to="/books/new" className="btn primary">Aggiungi libro</Link>}
                        </div>
                    </div>

                    <p className="info-row">
                        <span className="counter">Libri: <b>{user.shelf_num || 0}</b></span>
                        <span className="counter">Wishlist: <b>{user.wishlist_num || 0}</b></span>
                        <span className="counter">Valutazioni: <b>{user.ratings_num || 0}</b></span>
                        <span className="counter">Recensioni: <b>{user.reviews_num || 0}</b></span>
                    </p>
                </div>
            </div>
        );
    }
}

Shelf.propTypes = {
    uid: PropTypes.string.isRequired,
    user: PropTypes.shape({
        birth_date: PropTypes.string,
        creationTime: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        location: PropTypes.string,
        photoURL: PropTypes.string,
        sex: PropTypes.number,
        shelf_num: PropTypes.number,
        wishlist_num: PropTypes.number,
        ratings_num: PropTypes.number,
        reviews_num: PropTypes.number
    }).isRequired
}