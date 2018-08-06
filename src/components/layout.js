import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import NavigationClose from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import Link from 'react-router-dom/Link';
import NavLink from 'react-router-dom/NavLink';
import { signOut, uid } from '../config/firebase';
import { appName, getInitials } from '../config/shared';
import { darkTheme } from '../config/themes';
import { userType } from '../config/types';
import Footer from './footer';

export default class Layout extends React.Component {
  state = {
    drawerIsOpen: false,
    moreAnchorEl: null
  }

  static propTypes = {
    user: userType
  }
  
  onToggleDrawer = () => this.setState(prevState => ({ drawerIsOpen: !prevState.drawerIsOpen }));
  onCloseDrawer = () => this.setState({ drawerIsOpen: false });

  onOpenMore = e => this.setState({ moreAnchorEl: e.currentTarget });
  onCloseMore = () => this.setState({ moreAnchorEl: null });

  onOpenDialog = () => this.setState({ dialogIsOpen: true });
  onCloseDialog = () => this.setState({ dialogIsOpen: false });

  render() {
    const { drawerIsOpen, moreAnchorEl } = this.state;
    const { children, user } = this.props;

    return (
      <div id="layoutComponent">
        <AppBar id="appBarComponent" position="static">
          <Toolbar className="toolbar">
            <IconButton className="drawer-btn" aria-label="Menu" onClick={this.onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
            <Typography className="title" variant="title" color="inherit">
              <Link to="/">{appName}</Link>
            </Typography>
            {user ? 
              <React.Fragment>
                <IconButton
                  className="more-btn"
                  aria-label="More"
                  aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup="true"
                  onClick={this.onOpenMore}>
                  <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                </IconButton>
                <Menu
                  id="more-menu"
                  anchorEl={moreAnchorEl}
                  onClick={this.onCloseMore}
                  open={Boolean(moreAnchorEl)}
                  onClose={this.onCloseMore}>
                  <Link to="/profile"><MenuItem>Profilo</MenuItem></Link>
                  <Link to={`/dashboard/${uid}`}><MenuItem>Dashboard</MenuItem></Link>
                  <MenuItem onClick={() => signOut()}>Esci</MenuItem>
                </Menu>
              </React.Fragment>
            : 
              <Button><Link to="/login">Login</Link></Button>
            }
          </Toolbar>
        </AppBar>
        
        <MuiThemeProvider theme={darkTheme}>
          <Drawer
            className="drawer"
            open={drawerIsOpen}
            onClick={this.onCloseDrawer}>
            <nav className="list">
              {user && uid ? 
                <React.Fragment>
                  <NavLink to="/profile" className="auth-header">
                    <div className="background" style={{backgroundImage: `url(${user.photoURL})`}} />
                    <div className="user">
                      <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                      <div className="user-info">
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </NavLink>
                  {user.roles.admin && 
                    <NavLink to={`/admin`}><MenuItem>Amministrazione</MenuItem></NavLink>
                  }
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
        </MuiThemeProvider>
        
        <main>
          {children}
        </main>

        <Footer />
      </div> 
    )
  }
}