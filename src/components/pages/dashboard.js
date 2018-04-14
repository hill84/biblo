import React from 'react';
import { Tab, Tabs } from 'material-ui/Tabs';
import { Link } from 'react-router-dom';
import { uid, userRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { appName, calcAge, joinToLowerCase } from '../../config/shared';
import { userType } from '../../config/types';
import Avatar from '../avatar';
import Shelf from '../shelf';
import NoMatch from '../noMatch';

export default class Dashboard extends React.Component {
 	constructor(props) {
		super(props);
		this.state = {
			luid: uid,
			uid: null,
			user: null,
			follow: false,
			loading: false
		}
	}

	componentWillReceiveProps(nextProps) {
		const { user, match } = nextProps;
		if (nextProps !== this.props) {
			if (match.params.uid) {
				userRef(match.params.uid).onSnapshot(snap => {
					this.setState({ loading: false });
					if (snap.exists) {
						this.setState({
							user: snap.data(),
							uid: match.params.uid,
							follow: (user && user.stats.followed) && user.stats.followed.indexOf(match.params.uid) > -1
						});
					}
				});
			} else this.setState({ user: user });
		}
	}

	componentDidMount(props) {
		const { user, match } = this.props;
		if (match.params.uid) {
			userRef(match.params.uid).onSnapshot(snap => {
				this.setState({ loading: false });
				if (snap.exists) {
					this.setState({
						user: snap.data(),
						uid: match.params.uid,
						follow: (user && user.stats.followed) && user.stats.followed.indexOf(match.params.uid) > -1
					});
				}
			});
		} else this.setState({ user: user });
	}

	onFollowUser = (luid, uid) => {
		luid = this.state.luid;
		uid = this.state.uid;

		let visitedFollowers_num = this.state.user.stats.followers_num;
		let visitedFollowers = this.state.user.stats.followers || [];
		let visitedFollowersIndex = visitedFollowers.indexOf(luid);

		let visitorFollowed_num = this.props.user.stats.followed_num;
		let visitorFollowed = this.props.user.stats.followed || [];
		let visitorFollowedIndex = visitorFollowed.indexOf(uid);

		if (this.state.follow/*  || visitedFollowersIndex > -1 */) {
			visitedFollowers_num -= 1;
			visitorFollowed_num -= 1;
			visitedFollowers.splice(visitedFollowersIndex, 1);
			visitorFollowed.splice(visitorFollowedIndex, 1);
		} else {
			visitedFollowers_num += 1;
			visitorFollowed_num += 1;
			visitedFollowers.push(luid);
			visitorFollowed.push(uid);
		}

		// VISITED
		userRef(uid).update({
			'stats.followers_num': visitedFollowers_num,
			'stats.followers': visitedFollowers
		}).then(() => {
			//console.log('follow');
		});

		// VISITOR
		userRef(luid).update({
			'stats.followed_num': visitorFollowed_num,
			'stats.followed': visitorFollowed
		}).then(() => {
			//console.log('unfollow');
		});
	}

	render(props) {
		const { follow, user, uid, luid } = this.state;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());
		const isOwner = luid === uid;

		if (!user) return <NoMatch title="Dashboard utente non trovata" location={this.props.location} />

		return (
			<div className="container" ref="dashboardComponent">
				<div className="card dark">
					<div className="basic-profile">
						<div className="row text-align-center-sm">
							<div className="col-md-auto col-sm-12">
								<Avatar size={100} src={user.photoURL} alt={user.displayName} />
							</div>
							<div className="col">
								<h2 className="username">{user.displayName}</h2>
								<div className="info-row">
									{user.sex && <span className="counter">{user.sex === 'm' ? 'Uomo' : user.sex === 'f' ? 'Donna' : 'Altro'}</span>}
									{user.birth_date && <span className="counter">{calcAge(user.birth_date)} anni</span>}
									<span className="counter comma">
										{user.city && <span className="counter">{user.city}</span>}
										{user.country && <span className="counter">{user.country}</span>}
										{user.continent && <span className="counter">{user.continent}</span>}
									</span>
									{user.languages && <span className="counter">Parl{isOwner ? 'i' : 'a'} {joinToLowerCase(user.languages)}</span>}
									{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
									{isOwner && <button className="btn sm flat counter"><Link to="/profile">{icon.pencil()} Modifica profilo</Link></button>}
								</div>
								<div className="info-row">
									{!isOwner && 
										<button className={`btn ${follow ? 'success error-on-hover' : 'primary'}`} onClick={this.onFollowUser}>
											{follow ? 
												<span>
													<span className="hide-on-hover">{icon.check()} Segui</span>
													<span className="show-on-hover">Smetti</span>
												</span> 
											: <span>{icon.plus()} Segui</span> }
										</button>
									}
									<span className="counter">Seguito da: <b>{user.stats.followers_num || 0}</b></span>
									<span className="counter">Segu{isOwner ? 'i' : 'e'}: <b>{user.stats.followed_num || 0}</b></span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Tabs style={{marginTop: 15}} tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
					<Tab label="Libreria">
						<div className="card bottompend">
							<Shelf uid={uid} />
							<div className="info-row footer centered">
								<span className="counter">Libri: <b>{user.stats.shelf_num}</b></span>
								<span className="counter">Desideri: <b>{user.stats.wishlist_num}</b></span>
								<span className="counter">Valutazioni: <b>{user.stats.ratings_num}</b></span>
								<span className="counter">Recensioni: <b>{user.stats.reviews_num}</b></span>
							</div>
						</div>
					</Tab>
					<Tab label="Attività">
						<div className="card bottompend">
							<p>Attività</p>
						</div>
					</Tab>
					<Tab label="Contatti">
						<div className="card bottompend">
							<p>Contatti</p>
						</div>
					</Tab>
				</Tabs>
			</div>
		);
	}
}

Dashboard.propTypes = {
	user: userType
}