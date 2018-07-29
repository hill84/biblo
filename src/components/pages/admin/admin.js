import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import SwipeableViews from 'react-swipeable-views';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Link from 'react-router-dom/Link';
import { isAuthenticated, userRef } from '../../../config/firebase';
import { icon } from '../../../config/icons';
//import { appName, calcAge, getInitials, joinToLowerCase, timeSince } from '../../../config/shared';
import { funcType, userType } from '../../../config/types';

export default class Admin extends React.Component {
 	state = {
    isAdmin: false,
		aid: this.props.user && this.props.user.uid,
    user: null,
    loadingUser: true,
    tabSelected: 0
	}

	static propTypes = {
    openSnackbar: funcType.isRequired,
    user: userType
	}

 static getDerivedStateFromProps(props, state) {
    if (props.user) {
      if (props.user.uid !== state.aid) { 
        return { aid: props.user.uid }; 
      }
    }
    return null;
  } 

	componentDidMount() { 
    this._isMounted = true; 
    if (this.state.aid) this.fetchUser();
  }

	componentWillUnmount() { this._isMounted = false; }

  componentDidUpdate(prevProps, prevState) {
		if (this._isMounted) {
      if (this.state.aid !== prevState.aid) {
        this.fetchUser();
      }
		}
	}
    
  fetchUser = () => {
		const { aid } = this.state;
    //console.log('fetching user');
    userRef(aid).onSnapshot(snap => {
      if (snap.exists) {
        this.setState({
          isAdmin: snap.data().roles.admin,
          user: snap.data(),
          loadingUser: false
        });
      } else this.setState({ isAdmin: false, user: null, loadingUser: false });
    });
  }
  
  onTabSelect = (e, value) => this.setState({ tabSelected: value });

  onTabSelectIndex = index => this.setState({ tabSelected: index });

	render() {
		const { isAdmin, loadingUser, tabDir, tabSelected, user } = this.state;

		if (loadingUser) {
      return <div className="loader"><CircularProgress /></div>
    } else if (!isAdmin) {
      return (
        <div className="container empty" id="adminComponent">
          <div className="card dark empty text-center">
            <p>{icon.cancel()}</p>
            <p>Area riservata agli amministratori</p>
          </div>
        </div>
      );
    }

		return (
			<div className="container" id="adminComponent">
				
        <div className="actions text-center pad-v">
          <Link to="/new-book" className="btn primary">{icon.plus()} libro</Link>
          <Link to="/new-author" className="btn primary">{icon.plus()} autore</Link>
          <Link to="/new-collection" className="btn primary">{icon.plus()} collezione</Link>
          <Link to="/new-quote" className="btn primary">{icon.plus()} citazione</Link>
          <Link to="/new-notification" className="btn primary">{icon.plus()} Notifica</Link>
        </div>

        <AppBar position="static" className="appbar flat">
          <Tabs 
            value={tabSelected}
            onChange={this.onTabSelect}
            fullWidth
            scrollable
            scrollButtons="auto">
            <Tab label="Utenti" />
            <Tab label="Libri" />
            <Tab label="Autori" />
            <Tab label="Collezioni" />
            <Tab label="Citazioni" />
            <Tab label="Notifiche" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          className="tabs-container"
          axis="x"
          index={tabSelected}
          onChangeIndex={this.onTabSelectIndex}>
          <div className="tab card dark" dir={tabDir}>
            Utenti
          </div>
          <div className="card tab dark" dir={tabDir}>
            Libri
          </div>
          <div className="card tab dark" dir={tabDir}>
            Autori
          </div>
          <div className="card tab dark" dir={tabDir}>
            Collezioni
          </div>
          <div className="card tab dark" dir={tabDir}>
            Citazioni
          </div>
          <div className="card tab dark" dir={tabDir}>
            Notifiche
          </div>
        </SwipeableViews>

			</div>
		);
	}
}