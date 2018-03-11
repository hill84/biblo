import React from 'react';
import { local_uid, userRef } from '../../config/firebase';
import { userType } from '../../config/types';
import { appName, calcAge, joinToLowerCase } from '../../config/shared';
import { Link } from 'react-router-dom';
import { Avatar } from 'material-ui';
import { Tabs, Tab } from 'material-ui/Tabs';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
 	constructor(props) {
		super(props);
		this.state = {
			luid: local_uid,
			uid: null,
			user: this.props.user,
			follow: false,
			loading: false
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props) {
			if (nextProps.match.params.uid) {
				userRef(nextProps.match.params.uid).onSnapshot(snap => {
					this.setState({ loading: false });
					if (snap.exists) {
						this.setState({
							user: snap.data(),
							uid: nextProps.match.params.uid,
							follow: (nextProps.user && nextProps.user.stats.followed && nextProps.user.stats.followed.indexOf(nextProps.match.params.uid) > -1) ? true : false
						});
					}
				});
			} else {
				this.setState({
					user: nextProps.user
				});
			}
		}
		console.log(this.state.follow);
	}

	componentDidMount(props) {
		if (this.props.match.params.uid) {
			userRef(this.props.match.params.uid).onSnapshot(snap => {
				this.setState({ loading: false });
				if (snap.exists) {
					this.setState({
						user: snap.data(),
						uid: this.props.match.params.uid,
						follow: (this.props.user && this.props.user.stats.followed && this.props.user.stats.followed.indexOf(this.props.match.params.uid) > -1) ? true : false
					});
				}
			});
		}
	}

	onFollowUser = (luid, uid) => {
		luid = this.state.luid;
		uid = this.state.uid;

		let visitedFollowers_num = this.state.user.stats.followers_num;
		let visitedFollowers = this.state.user.stats.followers;
		let visitedFollowersIndex = visitedFollowers.indexOf(luid);

		let visitorFollowed_num = this.props.user.stats.followed_num;
		let visitorFollowed = this.props.user.stats.followed; // TODO
		let visitorFollowedIndex = visitorFollowed.indexOf(uid);

		if (this.state.follow/*  || visitedFollowersIndex > -1 */) {
			visitedFollowers_num -= 1;
			visitorFollowed_num -= 1;
			visitedFollowers.splice(visitedFollowersIndex, 1);
			visitorFollowed.push(uid);
		} else {
			visitedFollowers_num += 1;
			visitorFollowed_num += 1;
			visitedFollowers.push(luid);
			visitorFollowed.splice(visitorFollowedIndex, 1);
		}

		// VISITED
		userRef(uid).update({
			'stats.followers_num': visitedFollowers_num,
			'stats.followers': visitedFollowers
		}).then(() => {
			console.log('follow');
			this.setState({ follow: true });
		});

		// VISITOR
		userRef(luid).update({
			'stats.followed_num': visitorFollowed_num,
			'stats.followed': visitorFollowed
		}).then(() => {
			console.log('unfollow');
			this.setState({ follow: false });
		});
	}

	render(props) {
		const { user, uid, luid } = this.state;
		const creationYear = user && String(new Date(user.creationTime).getFullYear());
		const isOwner = luid === uid;

		if (!user || !uid) return null

		return (
			<div className="container" ref="dashboardComponent">	
				<h2>Dashboard</h2>
				<div className="card">
					<div className="basic-profile">
						<div className="row">
							<div className="col-auto">
								{user.photoURL ? 
									<Avatar src={user.photoURL} size={100} backgroundColor={'transparent'} /> 
								: user.displayName && 
									<Avatar size={100}>{user.displayName.charAt(0)}</Avatar> 
								}
							</div>
							<div className="col">
								<div className="username">{user.displayName}</div>
								<div className="info-row">
									{user.sex && <span className="counter">{user.sex === 'm' ? 'Uomo' : user.sex === 'f' ? 'Donna' : 'Altro'}</span>}
									{user.birth_date && <span className="counter">{calcAge(user.birth_date)} anni</span>}
									{user.city && <span className="counter">{user.city}</span>}
									{user.country && <span className="counter">{user.country}</span>}
									{user.continent && <span className="counter">{user.continent}</span>}
									{user.languages && <span className="counter">Parla {joinToLowerCase(user.languages)}</span>}
									{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
									{isOwner && <span className="counter"><Link to="/profile">Modifica profilo</Link></span>}
								</div>
								<div className="info-row">
									{!isOwner && <button className="btn primary" onClick={this.onFollowUser}>Segui</button>}
									<span className="counter">Follower: <b>{user.stats.followers_num || 0}</b></span>
									<span className="counter">Segue: <b>{user.stats.followed_num || 0}</b></span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<Tabs style={{marginTop: 20}} tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
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