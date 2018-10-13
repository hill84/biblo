import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import NavigationClose from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { authid, noteRef, notesRef, signOut } from '../config/firebase';
import { icon } from '../config/icons';
import { appName, getInitials, hasRole, timeSince } from '../config/shared';
import { darkTheme } from '../config/themes';
import { userType } from '../config/types';
import Footer from './footer';

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
    const { user } = this.state;
    if (user) {
      const notes = [];
      const roles = ['admin', 'editor', 'premium', 'public'];
      roles.forEach(role => {
        if (hasRole(user, role)) {
          notesRef(`__${role}`).onSnapshot(snap => {
            if (!snap.empty) {
              snap.forEach(note => {
                notes.push({ ...note.data(), role })
              });
            }
          });
        }
      });
      notesRef(user.uid).get().then(snap => {
        if (!snap.empty) {
          snap.forEach(note => {
            notes.push(note.data());
          });
          this.setState({ notes });
        }
      }).catch(error => console.warn(error));
    } else this.setState({ notes: null });
  }
  
  onToggleDrawer = () => this.setState(prevState => ({ drawerIsOpen: !prevState.drawerIsOpen }));
  onCloseDrawer = () => this.setState({ drawerIsOpen: false });

  onOpenMore = e => this.setState({ moreAnchorEl: e.currentTarget });
  onCloseMore = () => this.setState({ moreAnchorEl: null });

  onOpenNotes = e => {
    const { notes, user } = this.state;
    this.setState({ notesAnchorEl: e.currentTarget });
    notes && notes.filter(note => note.read !== true && !note.role).forEach(note => {
      /* this.setState({
        notes: { ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }
      }); */
      noteRef(user.uid, note.nid).update({ read: true }).then().catch(error => console.warn(error));
    });
  }
  onCloseNotes = () => this.setState({ notesAnchorEl: null });

  onOpenDialog = () => this.setState({ dialogIsOpen: true });
  onCloseDialog = () => this.setState({ dialogIsOpen: false });
  
  render() {
    const { drawerIsOpen, moreAnchorEl, notes, notesAnchorEl, user } = this.state;
    const { children } = this.props;
    const toRead = notes => notes && notes.filter(note => !note.read || note.role);

    return (
      <div id="layoutComponent">
        <AppBar id="appBarComponent" className="dark" position="static">
          <Toolbar className="toolbar">
            <IconButton className="drawer-btn" aria-label="Menu" onClick={this.onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
            <Typography className="title" variant="title" color="inherit">
              <Link to="/">{appName}<sup>Alpha</sup></Link>
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
                  title={`${notes ? toRead(notes).length : 0} notifiche`}>
                  {icon.bell()}
                  {notes && toRead(notes).length ? <div className="badge dot">{toRead(notes).length}</div> : null}
                </IconButton>
                <Menu
                  className="notes"
                  id="notes-menu"
                  anchorEl={notesAnchorEl}
                  onClick={this.onCloseNotes}
                  open={Boolean(notesAnchorEl)}
                  onClose={this.onCloseNotes}>
                  {notes && toRead(notes).length ?
                    toRead(notes).map((note, i) => (
                      <MenuItem key={note.nid} style={{animationDelay: `${(i + 1) / 10  }s`}}> 
                        <div className="row">
                          <div className="col text">
                            <div dangerouslySetInnerHTML={{__html: note.text}} />
                          </div>
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
                  <NavLink to={`/dashboard/${authid}`}><MenuItem>Dashboard</MenuItem></NavLink>
                  <MenuItem onClick={() => signOut()}>Esci</MenuItem>
                </Menu>
              </React.Fragment>
            : 
              <React.Fragment>
                <button className="btn flat"><Link to="/login">Accedi</Link></button>
                <button className="btn primary"><Link to="/signup">Registrati</Link></button>
              </React.Fragment>
            }
          </Toolbar>
        </AppBar>
        
        <MuiThemeProvider theme={darkTheme}>
          <Drawer
            className="drawer"
            open={drawerIsOpen}
            onClick={this.onCloseDrawer}>
            <nav className="list">
              {user && authid ? 
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
                    <NavLink to={`/admin`}>
                      <MenuItem>
                        <ListItemIcon>{icon.gauge()}</ListItemIcon>
                        <ListItemText inset primary="Amministrazione" />
                      </MenuItem>
                    </NavLink>
                  }
                  <NavLink to={`/dashboard/${authid}`}>
                    <MenuItem>
                      <ListItemIcon>{icon.homeAccount()}</ListItemIcon>
                      <ListItemText inset primary="Dashboard" />
                    </MenuItem>
                  </NavLink>
                </React.Fragment>
              :
                <div className="auth-header-buttons">
                  <NavLink to="/login">
                    <MenuItem>
                      <ListItemIcon>{icon.loginVariant()}</ListItemIcon>
                      <ListItemText inset primary="Accedi" />
                    </MenuItem>
                  </NavLink>
                  <NavLink to="/signup">
                    <MenuItem>
                      <ListItemIcon>{icon.accountPlus()}</ListItemIcon>
                      <ListItemText inset primary="Registrati" />
                    </MenuItem>
                  </NavLink>
                </div>
              }
              <NavLink to="/" exact>
                <MenuItem>
                  <ListItemIcon>{icon.home()}</ListItemIcon>
                  <ListItemText inset primary="Home" />
                </MenuItem>
              </NavLink>
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