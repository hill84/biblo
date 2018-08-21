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
import { /* noteRef,  */signOut, uid } from '../config/firebase';
import { appName, getInitials, timeSince } from '../config/shared';
import { darkTheme } from '../config/themes';
import { userType } from '../config/types';
import Footer from './footer';
import { icon } from '../config/icons';

export default class Layout extends React.Component {
  state = {
    drawerIsOpen: false,
    moreAnchorEl: null,
    notes: null,
    notesAnchorEl: null,
    user: this.props.user
  }

  static propTypes = {
    user: userType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user !== state.user) { return { user: props.user }}
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    const { user } = this.state;
    if(user !== prevState.user){
      setTimeout(() => {
        this.fetchNotes()
      }, 1000);
    }
  }

  fetchNotes = () => {
    //TODO
    /* const { user } = this.state;
    noteRef(user.uid).onSnapshot(snap => {
      if (!snap.empty) {
        const notes = [];
        snap.forEach(note => !note.data().read && notes.push(note.data()));
        this.setState({ notes });
      }
    }); */
  }
  
  onToggleDrawer = () => this.setState(prevState => ({ drawerIsOpen: !prevState.drawerIsOpen }));
  onCloseDrawer = () => this.setState({ drawerIsOpen: false });

  onOpenMore = e => this.setState({ moreAnchorEl: e.currentTarget });
  onCloseMore = () => this.setState({ moreAnchorEl: null });

  onOpenNotes = e => this.setState({ notesAnchorEl: e.currentTarget });
  onCloseNotes = () => this.setState({ notesAnchorEl: null });

  onOpenDialog = () => this.setState({ dialogIsOpen: true });
  onCloseDialog = () => this.setState({ dialogIsOpen: false });
  
  render() {
    const { drawerIsOpen, moreAnchorEl, notes, notesAnchorEl, user } = this.state;
    const { children } = this.props;

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
                  className="search-btn popIn reveal delay4"
                  component={Link} 
                  to="/books/add"
                  aria-label="Search">
                  {icon.magnify()}
                </IconButton>
                <IconButton
                  className="notes-btn popIn reveal delay2"
                  aria-label="Notifications"
                  aria-owns={notesAnchorEl ? 'notes-menu' : null}
                  aria-haspopup="true"
                  onClick={this.onOpenNotes}
                  title={`${notes ? notes.length : 0} notifiche`}>
                  {icon.bell()}
                  {notes && notes.length && <div className="dot">{notes.length}</div>}
                </IconButton>
                <Menu
                  className="notes"
                  id="notes-menu"
                  anchorEl={notesAnchorEl}
                  onClick={this.onCloseNotes}
                  open={Boolean(notesAnchorEl)}
                  onClose={this.onCloseNotes}>
                  {notes && notes.length ?
                    notes.map(note => (
                      <MenuItem> 
                        <div className="row">
                          <div className="col text">{note.text}</div>
                          <div className="col-auto date">{timeSince(note.created_num)}</div>
                        </div>
                      </MenuItem>
                    ))
                  : 
                    <MenuItem className="text"><span className="icon">{icon.bellOff()}</span> Non ci sono nuove notifiche</MenuItem>
                  }
                  <MenuItem className="footer"><Link to="/notifications">Mostra tutte</Link></MenuItem> 
                </Menu>

                <IconButton
                  className="more-btn"
                  aria-label="More"
                  aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup="true"
                  onClick={this.onOpenMore}>
                  <Avatar className="avatar popIn reveal" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                </IconButton>
                <Menu
                  id="more-menu"
                  anchorEl={moreAnchorEl}
                  onClick={this.onCloseMore}
                  open={Boolean(moreAnchorEl)}
                  onClose={this.onCloseMore}>
                  <NavLink to="/profile"><MenuItem>Profilo</MenuItem></NavLink>
                  <NavLink to={`/dashboard/${uid}`}><MenuItem>Dashboard</MenuItem></NavLink>
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