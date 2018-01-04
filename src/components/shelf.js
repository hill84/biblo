import React from 'react';
import { Link } from 'react-router-dom';
import { auth, shelfRef } from '../config/firebase';

export default class Shelf extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
			shelf: [{
                ISBN_num: 9788820372057,
                title: "Dove nasce la nuova fisica",
                subtitle: "Einstein, Hawking e gli altri alla corte di Solvay",
                authors: ["Gabriella Greison"],
                format: "Paperback",
                pages_num: 140,
                publisher: "Hoepli (Microscopi)",
                publication: "2016-xx-xx",
                genres: ["divulgazione"],
                rating_num: 4,
                reviewTitle: "",
                review: "",
                status: "reading", //reading, read, toRead, abandoned, reference
                start: "",
                end: ""
            }],
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