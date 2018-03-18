import React from 'react';
import { collectionsRef, local_uid } from '../../config/firebase';
import { icon } from '../../config/icons';
import { stringType } from '../../config/types';
import { Link } from 'react-router-dom';
import { skltn_shelfRow } from '../skeletons';
import Cover from '../cover';

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collection: null,
			collectionLoading: true,
			uid: local_uid || ''
		}
	}

	componentDidMount(props) {
		collectionsRef('Harry Potter').get().then(book => {
			this.setState({ collectionLoading: false });
			// TODO
		});
	}

	render() {
		const { collection, collectionLoading, uid } = this.state;
		let collectionCovers = collection && collection.map(book => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} /></Link> );

		return (
			<div className="container" id="homeComponent">
				<h2>{icon.home({style: {width: '1.5rem'}})} Home</h2>
				<div className="card dark">
					<div className="shelf">       
						<div className="collection hoverable-items">
							{collectionLoading ? skltn_shelfRow :
								<div className="shelf-row">
									{collectionCovers}
								</div>
							}
						</div>
					</div>
				</div>

				<div className="card">
					<ul>
						<li><Link to="/login">{icon.loginVariant()} Login</Link></li>
						<li><Link to="/signup">{icon.accountPlus()} Signup</Link></li>
						<li><Link to="/password-reset">{icon.lockReset()} Reset password</Link></li>
						<li><Link to={`/dashboard/${uid}`}>{icon.dashboard()} Dashboard</Link></li>
						<li><Link to="/books/add">{icon.plusCircle()} Add book</Link></li>
						<li><Link to="/new-book">{icon.newBox()} New book</Link></li>
						<li><Link to="/profile">{icon.accountCircle()} Profile</Link></li>
						<li><Link to="/error404">No match</Link></li>
					</ul>
				</div>
			</div>
		)
	}
}

Home.propTypes = {
	uid: stringType
}