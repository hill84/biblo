import CircularProgress from 'material-ui/CircularProgress';
import { Tab, Tabs } from 'material-ui/Tabs';
import React from 'react';
import Link from 'react-router-dom/Link';
import { isAuthenticated, userRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { appName, calcAge, joinToLowerCase } from '../../config/shared';
import { userType } from '../../config/types';
import Avatar from '../avatar';
import NoMatch from '../noMatch';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
 	state = {
		luid: this.props.user && this.props.user.uid,
		uid: null,
		user: null,
		follow: false,
		loading: true,
		progress: 0
	}

	static propTypes = {
		user: userType
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if ((nextProps.user && nextProps.user.uid) !== prevState.luid) { return { luid: nextProps.user.uid }; }
    if (nextProps.match.params.uid !== prevState.uid) { return { uid: nextProps.match.params.uid }; }
    return null;
  }

	componentDidMount() {
		this._isMounted = true;
		this.fetchUser();
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

  componentDidUpdate(prevProps, prevState) {
		if (this._isMounted) {
			if(this.state.uid !== prevState.uid){
				this.fetchUser();
			}
			if(this.state.luid !== prevState.luid){
				if (prevState.luid !== null) {
					this.fetchUser();
				}
			}
		}
	}
	
	fetchUser = () => {
		const { match } = this.props;
		const { luid, user } = this.state;
		if (match.params.uid) {
			userRef(match.params.uid).onSnapshot(snap => {
				this.setState({ loading: false });
				if (snap.exists) {
					/* let count = -4;
					let tot = Object.keys(snap.data()).length - 4;
					Object.keys(snap.data()).forEach(i => { if (typeof i !== 'undefined') count++ }); */
					this.setState({
						user: snap.data(),
						follow: (user && user.stats.followers) && user.stats.followers.indexOf(luid) > -1,
						progress: 100 // / tot * count
					});
				} else this.setState({ user: null });
			});
		} else this.setState({ user: user });
	}

	onFollowUser = (luid, uid) => {
		if (isAuthenticated()) {
			luid = this.state.luid;
			uid = this.state.uid;
	
			let visitedFollowers_num = this.state.user.stats.followers_num;
			let visitedFollowers = this.state.user.stats.followers || [];
			const visitedFollowersIndex = visitedFollowers.indexOf(luid);
	
			let visitorFollowed_num = this.props.user.stats.followed_num;
			let visitorFollowed = this.props.user.stats.followed || [];
			const visitorFollowedIndex = visitorFollowed.indexOf(uid);
	
			if (this.state.follow/* || visitedFollowersIndex > -1 */) {
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
				//console.log(`follow ${uid}`);
			});
	
			// VISITOR
			userRef(luid).update({
				'stats.followed_num': visitorFollowed_num,
				'stats.followed': visitorFollowed
			}).then(() => {
				//console.log(`Unfollow ${uid}`);
			});
		}
	}

	render(props) {
		const { follow, loading, luid, progress, uid, user } = this.state;

		if (!user) {
			if (loading) {
				return (
					<div className="container">
						<div className="card dark empty text-align-center">
							<CircularProgress />
						</div>
					</div>
				)
			} else {
				return <NoMatch title="Dashboard utente non trovata" location={this.props.location} />
			}
		}

		const followers = user.stats.followers.map(f => <div className="info-row"><Link to={`/dashboard/${f}`}>{f}</Link></div>);
		const followed = user.stats.followed.map(f => <div className="info-row"><Link to={`/dashboard/${f}`}>{f}</Link></div>);

		const creationYear = user && String(new Date(user.creationTime).getFullYear());
		const isOwner = () => luid === uid;
		const ShelfDetails = () => {
			return (
				<div className="info-row footer centered">
					<span className="counter">Libri: <b>{user.stats.shelf_num}</b></span>
					<span className="counter">Desideri: <b>{user.stats.wishlist_num}</b></span>
					<span className="counter">Valutazioni: <b>{user.stats.ratings_num}</b></span>
					<span className="counter">Recensioni: <b>{user.stats.reviews_num}</b></span>
				</div>
			)
		}

		return (
			<div className="container" id="dashboardComponent">
				<div className="row">
					<div className="col-md col-12">
						<div className="card dark">
							<div className="basic-profile">
								<div className="role-badges">
									{user.roles.admin && <div className="badge admin">Admin</div>}
									{user.roles.editor && <div className="badge editor">Editor</div>}
								</div>
								<div className="row text-align-center-md">
									<div className="col-md-auto col-sm-12">
										<Avatar size={70} src={user.photoURL} alt={user.displayName} />
									</div>
									<div className="col">
										<h2 className="username">{user.displayName}</h2>
										<div className="info-row">
											{user.sex && <span className="counter">{user.sex === 'm' ? 'Uomo' : user.sex === 'f' ? 'Donna' : 'Altro'}</span>}
											{user.birth_date && <span className="counter">{calcAge(user.birth_date)} anni</span>}
											<span className="counter hide-xs comma">
												{user.city && <span className="counter">{user.city}</span>}
												{user.country && <span className="counter">{user.country}</span>}
												{user.continent && <span className="counter">{user.continent}</span>}
											</span>
											{user.languages && <span className="counter hide-sm">Parl{isOwner() ? 'i' : 'a'} {joinToLowerCase(user.languages)}</span>}
											{user.creationTime && <span className="counter">Su {appName} dal <b>{creationYear}</b></span>}
											{isOwner && progress === 100 && <Link to="/profile"><button className="btn sm flat counter">{icon.pencil()} Modifica profilo</button></Link>}
										</div>
										<div className="info-row">
											{!isOwner() && 
												<button 
													className={`btn ${follow ? 'success error-on-hover' : 'primary'}`} 
													disabled={!isAuthenticated()}
													onClick={this.onFollowUser}>
													{follow ? 
														<span>
															<span className="hide-on-hover">{icon.check()} Segui</span>
															<span className="show-on-hover">Smetti</span>
														</span> 
													: <span>{icon.plus()} Segui</span> }
												</button>
											}
											<span className="counter">Seguito da: <b>{user.stats.followers_num || 0}</b></span>
											<span className="counter">Segu{isOwner() ? 'i' : 'e'}: <b>{user.stats.followed_num || 0}</b></span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{isOwner && progress < 100 && 
						<div className="col-md-auto col-12 hide-md flex">
							<div className="card dark text-align-center">
								<div className="progress-container">
									<div className="progress-base"></div>
									<CircularProgress mode="determinate" value={progress} size={60} max={100} thickness={5} />
									<div className="progress-value">{progress}%</div>
								</div>
								<div className="info-row"><Link to="/profile"><button className="btn primary centered">Completa profilo</button></Link></div>
							</div>
						</div>
					}
				</div>

				<Tabs tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
					<Tab label="Libreria">
						<div className="card bottompend">
							<Shelf uid={uid} shelf="bookInShelf"/>
							<ShelfDetails />
						</div>
					</Tab>
					<Tab label="Desideri">
						<div className="card bottompend">
							<Shelf uid={uid} shelf="bookInWishlist" />
							<ShelfDetails />
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
							<div className="row">
								<div className="col">
									<h4>Seguito da:</h4>
									{followers}
								</div>
								<div className="col">
									<h4>Segue:</h4>
									{followed}
								</div>
							</div>
						</div>
					</Tab>
				</Tabs>
			</div>
		);
	}
}