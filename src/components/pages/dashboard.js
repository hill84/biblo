import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import Link from 'react-router-dom/Link';
import SwipeableViews from 'react-swipeable-views';
import { isAuthenticated, userRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { appName, calcAge, getInitials, joinToLowerCase } from '../../config/shared';
import { userType } from '../../config/types';
import NoMatch from '../noMatch';
import Shelf from '../shelf';

export default class Dashboard extends React.Component {
 	state = {
    isOwner: this.props.user ? this.props.user.uid === this.props.match.params.uid : false,
		luid: this.props.user && this.props.user.uid,
		uid: this.props.match.params.uid,
		user: null,
		follow: false,
		loading: true,
    progress: 0,
    tabSelected: 0
	}

	static propTypes = {
		user: userType
	}

	static getDerivedStateFromProps(props, state) {
    if (props.user) {
      if (props.user.uid !== state.luid) { 
				return { 
					luid: props.user.uid, 
					isOwner: props.user.uid === state.uid
				}; 
			}
    } else { return { luid: null }; }
    if (props.match.params.uid !== state.uid) { 
			return { 
				uid: props.match.params.uid, 
				isOwner: state.luid === props.match.params.uid 
			}; 
		}
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
			if ((this.state.uid !== prevState.uid) || (this.state.luid !== prevState.luid)) {
				this.fetchUser();
			}
		}
  }
	
	fetchUser = () => {
    const { luid, uid, user } = this.state;
		if (uid) {
			userRef(uid).onSnapshot(snap => {
				this.setState({ loading: false });
				if (snap.exists) {
					/* let count = -4;
					let tot = Object.keys(snap.data()).length - 4;
					Object.keys(snap.data()).forEach(i => { if (typeof i !== 'undefined') count++ }); */
					this.setState({
            isOwner: luid === uid,
						user: snap.data(),
						follow: (snap.data().stats.followers) && snap.data().stats.followers.indexOf(luid) > -1,
						progress: 100 // / tot * count
          });
				} else this.setState({ isOwner: false, user: null });
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
  
  handleChange = (event, value) => this.setState({ tabSelected: value });

  handleChangeIndex = index => this.setState({ tabSelected: index });

	render() {
		const { follow, isOwner, loading, luid, progress, tabDir, tabSelected, uid, user } = this.state;

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
				return <NoMatch title="Dashboard utente non trovata" location={this.props.location} history={this.props.history} />
			}
		}

		const followers = user.stats.followers.map(f => <div key={f} className="info-row"><Link to={`/dashboard/${f}`}>{f}</Link></div>);
    const followed = user.stats.followed.map(f => <div key={f} className="info-row"><Link to={`/dashboard/${f}`}>{f}</Link></div>);
    const roles = Object.keys(user.roles).map((r, i) => user.roles[r] && <div key={i+'_'+r} className={`badge ${r}`}>{r}</div>);

		const creationYear = user && String(new Date(user.creationTime).getFullYear());
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
						<div className="card dark basic-profile-card">
							<div className="basic-profile">
								<div className="role-badges">
									{roles}
								</div>
								<div className="row text-align-center-md">
									<div className="col-md-auto col-sm-12">
										<Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
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
											{user.languages && <span className="counter hide-sm">Parl{isOwner ? 'i' : 'a'} {joinToLowerCase(user.languages)}</span>}
											{user.creationTime && <span className="counter hide-sm">Su {appName} dal <b>{creationYear}</b></span>}
											{isOwner && progress === 100 && <Link to="/profile"><button className="btn sm flat counter">{icon.pencil()} Modifica</button></Link>}
										</div>
										<div className="info-row">
											{!isOwner && 
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
											<span className="counter">Segu{isOwner ? 'i' : 'e'}: <b>{user.stats.followed_num || 0}</b></span>
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

        <AppBar position="static" className="toppend">
          <Tabs 
            //tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}
            value={tabSelected}
            onChange={this.handleChange}
            fullWidth
            scrollable
            scrollButtons="auto">
            <Tab label="Libreria" />
            <Tab label="Desideri" />
            <Tab label="Attività" />
            <Tab label="Contatti" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          className="card bottompend tabs-container"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.handleChangeIndex}>
          <div className="card tab" dir={tabDir}>
            <Shelf luid={luid} uid={uid} shelf="bookInShelf"/>
            <ShelfDetails />
          </div>
          <div className="card tab" dir={tabDir}>
            <Shelf luid={luid} uid={uid} shelf="bookInWishlist" />
            <ShelfDetails />
          </div>
          <div className="card tab" dir={tabDir}>
            <p>Attività</p>
          </div>
          <div className="card tab" dir={tabDir}>
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
        </SwipeableViews>
			</div>
		);
	}
}