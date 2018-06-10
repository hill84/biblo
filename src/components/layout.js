import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import Link from 'react-router-dom/Link';
import NavLink from 'react-router-dom/NavLink';
import { signOut, uid } from '../config/firebase';
import { appName } from '../config/shared';
import { userType } from '../config/types';

export default class Layout extends React.Component {
  state = {
    drawerIsOpen: false
  }

  static propTypes = {
    user: userType
  }
  
  onToggleDrawer = prevState => this.setState({drawerIsOpen: !prevState.drawerIsOpen});
  onCloseDrawer = () => this.setState({drawerIsOpen: false});

  onOpenDialog = () => this.setState({dialogIsOpen: true});
  onCloseDialog = () => this.setState({dialogIsOpen: false});

  render() {
    const { drawerIsOpen } = this.state;
    const { children, user } = this.props;

    return (
      <div id="layoutComponent">
        <AppBar 
          id="appBarComponent"
          position="static"
          title={<Link to="/">{appName}</Link>}
          iconElementLeft={
            <IconButton onClick={this.onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <NavigationMenu />}
            </IconButton>
          }
          iconElementRight={ 
            user ? <Logged /> : <FlatButton label="Login" containerElement={<Link to="/login" />} /> 
          }
        />
        
        <Drawer
          docked={false}
          open={drawerIsOpen}
          onRequestChange={drawerIsOpen => this.setState({drawerIsOpen})}>
          <nav onClick={this.onCloseDrawer}>
            {user && uid ? 
              <React.Fragment>
                <NavLink to="/profile" className="auth-header">
                  <div className="background" style={{backgroundImage: `url(${user.photoURL})`}} />
                  <div className="user">
                    {user.photoURL ? <Avatar src={user.photoURL} /> : <Avatar>{user.displayName && user.displayName.charAt(0)}</Avatar>}
                    <div className="user-info">
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </NavLink>
                <NavLink to={`/dashboard/${uid}`}><MenuItem>Dashboard</MenuItem></NavLink>
              </React.Fragment>
            :
              <div className="auth-header-buttons">
                <NavLink to="/login"><MenuItem>Login</MenuItem></NavLink>
                <NavLink to="/signup"><MenuItem>Signup</MenuItem></NavLink>
              </div>
            }
            <NavLink to="/" exact><MenuItem>Home</MenuItem></NavLink>
          </nav>
        </Drawer>
        
        <main>
          {children}
        </main>
      </div> 
    )
  }
}

const Logged = props => (
  <IconMenu
    {...props}
    iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <Link to="/profile"><MenuItem primaryText="Profilo" /></Link>
    <Link to={`/dashboard/${uid}`}><MenuItem primaryText="Dashboard" /></Link>
    <MenuItem primaryText="Logout" onClick={() => signOut()} />
  </IconMenu>
);
Logged.muiName = 'IconMenu';