import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { Link } from 'react-router-dom';
import SwipeableViews from 'react-swipeable-views';
import { followersRef, followingsRef, isAuthenticated, userRef } from '../../config/firebase';
import { icon } from '../../config/icons';
import { appName, calcAge, getInitials, joinToLowerCase, timeSince } from '../../config/shared';
import { funcType, userType } from '../../config/types';
import NewFeature from '../newFeature';
import NoMatch from '../noMatch';
import Shelf from '../shelf';

const tabs = ['shelf', 'wishlist', 'activity', 'contacts'];

export default class Dashboard extends React.Component {
 	state = {
    isOwner: this.props.user ? this.props.user.uid === this.props.match.params.uid : false,
		luid: this.props.user && this.props.user.uid,
		uid: this.props.match.params.uid,
    user: null,
		followers: {},
		followers_num: 0,
		followings: {},
		followings_num: 0,
    follow: false,
    lfollowers: {},
    lfollowings: {},
		loading: true,
    progress: 0,
    tabSelected: this.props.match.params.tab ? tabs.indexOf(this.props.match.params.tab) !== -1 ? tabs.indexOf(this.props.match.params.tab) : 0 : 0,
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
  }

	static getDerivedStateFromProps(props, state) {
    if (tabs.indexOf(props.match.params.tab) !== -1) {
      if (tabs.indexOf(props.match.params.tab) !== state.tabSelected) {
        return { tabSelected: tabs.indexOf(props.match.params.tab) };
      }
    }
    if (props.user) {
      if (props.user.uid !== state.luid) { 
				return { 
					luid: props.user.uid, 
					isOwner: props.user.uid === state.uid
				}; 
      }
    }
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
    if (this.state.uid) {
      this.fetchUser();
      this.fetchFollowers();
      this.fetchFollowings();
      if (this.state.tabSelected === 0) this.props.history.replace(`/dashboard/${this.state.uid}/${tabs[0]}`, null);
    }
  }

	componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if (this.state.uid !== prevState.uid || this.state.luid !== prevState.luid) {
        this.fetchUser();
        this.fetchFollowers();
        this.fetchFollowings();
      }
    }
	}
    
  fetchUser = () => {
		const { luid, uid } = this.state;
    // console.log('fetching user');
    userRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        let count = 0;
        const keys = ['creationTime', 'uid', 'displayName', 'email', 'birth_date', 'continent', 'country', 'city', 'languages', 'photoURL', 'sex', 'roles', 'stats'];
        const tot = keys.length;
        Object.keys(snap.data()).forEach(i => { 
          // console.log(i + ': ' + typeof snap.data()[i] + ' - ' + snap.data()[i]);
          if (typeof snap.data()[i] === 'string') {
            if (snap.data()[i] !== '') count++ 
          } else if (Array.isArray(snap.data()[i])) {
            if (snap.data()[i].length > 0) count++ 
          } else count++
        });
        // console.log(count, tot);
        this.setState({
          isOwner: luid ? luid === uid : false,
          user: snap.data(),
          progress: Number((100 / tot * count).toFixed(0))
        });
        this.setState({ loading: false });
      } else this.setState({ isOwner: false, user: null, loading: false });
    });
  }
  
	fetchFollowers = () => {
		const { luid, uid } = this.state;
    // console.log('fetching followers');
    followersRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        // console.log(snap.data());
        this.setState({
          followers: snap.data(),
          followers_num: Object.keys(snap.data()).length,
          follow: luid ? Object.keys(snap.data()).indexOf(luid) > -1 : false
        });
      } else this.setState({ followers: {}, followers_num: 0, follow: false });
    });
    if (isAuthenticated()) {
      if (luid && luid !== uid) {
        // console.log('fetching lfollowers');
        followersRef(luid).onSnapshot(snap => {
          if (snap.exists) {
            // console.log({ lfollowers: snap.data() });
            this.setState({ lfollowers: snap.data() });
          } else this.setState({ lfollowers: {} });
        });
      }
    }
	}

	fetchFollowings = () => {
		const { luid, uid } = this.state;
    // console.log('fetching followings');
    followingsRef(uid).onSnapshot(snap => {
      if (snap.exists) {
        // console.log(snap.data());
        this.setState({
          followings: snap.data(),
          followings_num: Object.keys(snap.data()).length
        });
      } else this.setState({ followings: {}, followings_num: 0 });
    });
    if (luid && luid !== uid) {
      // console.log('fetching lfollowings');
      followingsRef(luid).onSnapshot(snap => {
        if (snap.exists) {
          // console.log({ lfollowings: snap.data() });
          this.setState({ lfollowings: snap.data() });
        } else this.setState({ lfollowings: {} });
      });
    }
	}

	onFollowUser = (e, fuid = this.state.user.uid, fuser = this.state.user) => {
    e.preventDefault();
    const { openSnackbar } = this.props;
		if (isAuthenticated()) {
			const { followers, followings, lfollowers, lfollowings, luid, uid } = this.state;
			const computedFollowers = luid !== uid ? { ...lfollowers } : { ...followers };
			const computedFollowings = luid !== uid ? { ...lfollowings } : { ...followings };
			// console.log({ luid, fuid, computedFollowers, computedFollowings, followers, followings, lfollowers, lfollowings });
      let snackbarMsg = '';
      const lindex = Object.keys(computedFollowers).indexOf(luid);
			const findex = Object.keys(computedFollowings).indexOf(fuid);
			
			// console.log({ lindex, findex });

      if (lindex > -1 || findex > -1) {
        if (lindex > -1) delete computedFollowers[luid];
				if (findex > -1) delete computedFollowings[fuid];
        snackbarMsg = `Non segui più ${fuser.displayName}`;
      } else {
				computedFollowers[luid] = {
          displayName: this.props.user.displayName,
          photoURL: this.props.user.photoURL,
          timestamp: (new Date()).getTime()
        };
				computedFollowings[fuid] = {
          displayName: fuser.displayName,
          photoURL: fuser.photoURL,
          timestamp: (new Date()).getTime()
        };
				snackbarMsg = `Segui ${fuser.displayName}`;
			}

			// console.log({ computedFollowers, computedFollowings });
	
			// VISITED
			followersRef(fuid).set(computedFollowers).then(() => openSnackbar(snackbarMsg, 'success')); 
	
			// VISITOR
			followingsRef(luid).set(computedFollowings).then(() => openSnackbar(snackbarMsg, 'success'));
			
    } else console.warn('User is not authenticated');
  }
  
  onTabSelect = (e, value) => {
    if (value !== -1) this.props.history.push(`/dashboard/${this.state.uid}/${tabs[value]}`, null);
    this.setState({ tabSelected: value });
  };

  onTabSelectIndex = index => this.setState({ tabSelected: index });

	render() {
		const { follow, followers, followers_num, followings, followings_num, isOwner, loading, luid, progress, tabDir, tabSelected, uid, user } = this.state;

		if (!user) {
			if (loading) return <div className="loader"><CircularProgress /></div>
			return <NoMatch title="Dashboard utente non trovata" location={this.props.location} history={this.props.history} />
		}

		const usersList = obj => Object.keys(obj).map(f => (
        <div key={f} className="avatar-row">
          <Link to={`/dashboard/${f}`} className="row ripple">
            <div className="col">
              <Avatar className="avatar" src={obj[f].photoURL} alt={obj[f].displayName}>{!obj[f].photoURL && getInitials(obj[f].displayName)}</Avatar>{obj[f].displayName}
            </div>
            <div className="col-auto">
              <div className="timestamp hide-on-hover">{timeSince(obj[f].timestamp)}</div>
              {isOwner && f !== luid && <button className="btn flat show-on-hover" onClick={e => this.onFollowUser(e, f, obj[f])}>
                {obj === followings ? 'Non seguire' : 'Segui'}
              </button>}
            </div>
          </Link>
        </div> 
      ));
    const Followers = usersList(followers);
    const Followings = usersList(followings);
    const Roles = Object.keys(user.roles).map((r, i) => user.roles[r] && <div key={`${i}_${r}`} className={`badge ${r}`}>{r}</div>);

		const creationYear = user && String(new Date(user.creationTime).getFullYear());
		const ShelfDetails = () => (
      <div className="info-row footer centered shelfdetails">
        <span className="counter">{icon.book()} <span className="hide-sm">Libri:</span> <b>{user.stats.shelf_num}</b></span>
        <span className="counter">{icon.heartOutline()} <span className="hide-sm">Desideri:</span> <b>{user.stats.wishlist_num}</b></span>
        <span className="counter">{icon.starOutline()} <span className="hide-sm">Valutazioni:</span> <b>{user.stats.ratings_num}</b></span>
        <span className="counter">{icon.messageTextOutline()} <span className="hide-sm">Recensioni:</span> <b>{user.stats.reviews_num}</b></span>
      </div>
    );
		const EmptyRow = () => (
      <div className="avatar-row empty">
        <div className="row">
          <div className="col">Nessuno</div>
        </div>
      </div>
    );
    const TabLabel = (icon, label) => (
      <React.Fragment>
        <span className="icon show-md">{icon}</span>
        <span className="label">{label}</span>
      </React.Fragment>
    );

		return (
			<div className="container" id="dashboardComponent">
				<div className="row">
					<div className="col-md col-12">
						<div className="card dark basic-profile-card">
							<div className="basic-profile">
								<div className="role-badges">{Roles}</div>
								<div className="row text-center-md">
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
											{!isOwner && isAuthenticated() &&
												<button 
													className={`btn ${follow ? 'success error-on-hover' : 'primary'}`} 
													// disabled={!isAuthenticated()}
													onClick={e => this.onFollowUser(e)}>
													{follow ? 
														<React.Fragment>
															<span className="hide-on-hover">{icon.check()} Segui</span>
															<span className="show-on-hover">Smetti</span>
														</React.Fragment> 
													: <span>{icon.plus()} Segui</span> }
												</button>
											}
											<span className="counter">Seguito da: <b>{followers_num}</b></span>
											<span className="counter">Segu{isOwner ? 'i' : 'e'}: <b>{followings_num}</b></span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{isOwner && progress < 100 &&
						<div className="col-md-auto col-12 hide-md flex">
							<div className="card dark pad-v-sm text-center flex align-items-center">
                <div className="container">
                  <div className="progress-container">
                    <div className="progress-base" />
                    <CircularProgress variant="static" value={progress} size={60} max={100} thickness={3} />
                    <div className="progress-value">{progress}%</div>
                  </div>
                  <div className="info-row"><Link to="/profile" className="btn primary centered">Completa profilo</Link></div>
                </div>
							</div>
						</div>
					}
				</div>

        <AppBar position="static" className="appbar toppend mobile">
          <Tabs 
            // tabItemContainerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}
            value={tabSelected}
            onChange={this.onTabSelect}
            fullWidth
            scrollable
            scrollButtons="auto">
            <Tab label={TabLabel(icon.book(), 'Libreria')} />
            <Tab label={TabLabel(icon.heart(), 'Desideri')} />
            <Tab label={TabLabel(icon.poll(), 'Attività')} />
            <Tab label={TabLabel(icon.account(), 'Contatti')} />
          </Tabs>
        </AppBar>
        <SwipeableViews
          className="card tabs-container bottompend mobile"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.onTabSelectIndex}>
          <div className="card tab" dir={tabDir}>
            {tabSelected === 0 && <Shelf luid={luid} uid={uid} shelf="bookInShelf"/>}
          </div>
          <div className="card tab" dir={tabDir}>
            {tabSelected === 1 && <Shelf luid={luid} uid={uid} shelf="bookInWishlist" />}
          </div>
          <div className="card tab" dir={tabDir}>
            {tabSelected === 2 && <NewFeature />}
          </div>
          <div className="card tab contacts-tab" dir={tabDir}>
            {tabSelected === 3 && 
              <div className="row">
                <div className="col-md-6 cols-12">
                  <h4>Seguito da:</h4>
                  {Object.keys(followers).length ? Followers : <EmptyRow />}
                </div>
                <div className="col-md-6 col-12">
                  <h4>Segue:</h4>
                  {Object.keys(followings).length ? Followings : <EmptyRow />}
                </div>
              </div>
            }
          </div>
        </SwipeableViews>
        <ShelfDetails />
			</div>
		);
	}
}