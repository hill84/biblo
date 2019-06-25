import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import NavigationClose from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import CookieBanner from 'react-cookie-banner';
import { Link, NavLink } from 'react-router-dom';
import { version } from '../../package.json';
import { authid, noteRef, notesRef, signOut } from '../config/firebase';
import { icon } from '../config/icons';
import { roles } from '../config/lists';
import { app, getInitials, hasRole, timeSince } from '../config/shared';
import { darkTheme } from '../config/themes';
import { funcType, stringType, userType } from '../config/types';
import Footer from './footer';

export default class Layout extends React.Component {
  state = {
    drawerIsOpen: false,
    moreAnchorEl: null,
    notes: null,
    notesAnchorEl: null
  }

  static propTypes = {
    error: stringType,
    openSnackbar: funcType.isRequired,
    user: userType
  }
  
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.timer && clearTimeout(this.timer);
    this.unsubNotesFetch && this.unsubNotesFetch();
  }

  componentDidUpdate(prevProps) {
    const { error, openSnackbar, user } = this.props;
    if (this._isMounted) {
      if (user !== prevProps.user){
        this.timer = setTimeout(() => {
          this.fetchNotes()
        }, 1000);
      }
      if (error !== prevProps.error) {
        openSnackbar(error, 'error', 9000);
      }
    }
  }

  fetchNotes = () => {
    const { user } = this.props;

    if (user) {
      const notes = [];
      roles.forEach(role => {
        if (hasRole(user, role)) {
          this.unsubNotesFetch = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot(snap => {
            if (!snap.empty) {
              snap.forEach(note => {
                notes.push({ ...note.data(), role })
              });
            }
          });
        }
      });
      notesRef(user.uid).orderBy('created_num', 'desc').limit(10).get().then(snap => {
        if (!snap.empty) {
          snap.forEach(note => {
            notes.push(note.data());
          });
          if (this._isMounted) this.setState({ notes });
        }
      }).catch(error => console.warn(error));
    } else {
      if (this._isMounted) this.setState({ notes: null });
    }
  }
  
  onToggleDrawer = () => this.setState(prevState => ({ drawerIsOpen: !prevState.drawerIsOpen }));
  onCloseDrawer = () => this.setState({ drawerIsOpen: false });

  onOpenMore = e => this.setState({ moreAnchorEl: e.currentTarget });
  onCloseMore = () => this.setState({ moreAnchorEl: null });

  onOpenNotes = e => {
    const { notes } = this.state;
    const { user } = this.props;

    if (this._isMounted) this.setState({ notesAnchorEl: e.currentTarget });
    notes && notes.filter(note => note.read !== true && !note.role).forEach(note => {
      /* if (this._isMounted) {
        this.setState({
          notes: { ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }
        }); 
      } */
      noteRef(user.uid, note.nid).update({ read: true }).then().catch(error => console.warn(error));
    });
  }
  onCloseNotes = () => this.setState({ notesAnchorEl: null });

  onOpenDialog = () => this.setState({ dialogIsOpen: true });
  onCloseDialog = () => this.setState({ dialogIsOpen: false });
  
  render() {
    const { drawerIsOpen, moreAnchorEl, notes, notesAnchorEl } = this.state;
    const { children, user } = this.props;
    const toRead = notes => notes && notes.filter(note => !note.read || note.role);

    return (
      <div id="layoutComponent">
        <AppBar id="appBarComponent" className="dark" position="static">
          <Toolbar className="toolbar">
            <Tooltip title="Menu" placement="bottom">
              <IconButton className="drawer-btn" aria-label="Menu" onClick={this.onToggleDrawer}> 
                {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            <Typography className="title" variant="h6" color="inherit">
              <Link to="/">{app.name}<sup>Beta</sup></Link>
            </Typography>
            {user ? 
              <React.Fragment>
                {user.roles.admin && 
                  <Tooltip title="Aggiungi libro" placement="bottom">
                    <IconButton
                      className="search-btn popIn reveal delay6 hide-xs"
                      component={Link} 
                      to="/new-book"
                      aria-label="New book">
                      {icon.plus()}
                    </IconButton>
                  </Tooltip>
                }
                <Tooltip title="Cerca libro" placement="bottom">
                  <IconButton
                    className="search-btn popIn reveal delay4"
                    component={Link} 
                    to="/books/add"
                    aria-label="Search">
                    {icon.magnify()}
                  </IconButton>
                </Tooltip>
                <Tooltip title={`${notes ? toRead(notes).length : 0} notifiche`} placement="bottom">
                  <IconButton
                    className="notes-btn popIn reveal delay2"
                    aria-label="Notifications"
                    aria-owns={notesAnchorEl ? 'notes-menu' : null}
                    aria-haspopup="true"
                    onClick={this.onOpenNotes}>
                    {icon.bell()}
                    {notes && toRead(notes).length ? <div className="badge dot">{toRead(notes).length}</div> : null}
                  </IconButton>
                </Tooltip>
                <Menu
                  id="notes-menu"
                  className="dropdown-menu notes"
                  anchorEl={notesAnchorEl}
                  onClick={this.onCloseNotes}
                  open={Boolean(notesAnchorEl)}
                  onClose={this.onCloseNotes}>
                  {notes && toRead(notes).length ?
                    toRead(notes).map((note, i) => (
                      <MenuItem key={note.nid} style={{animationDelay: `${(i + 1) / 10  }s`}}> 
                        <div className="row">
                          {note.photoURL && <div className="col-auto image"><img src={note.photoURL} className="avatar" alt="avatar" /></div>}
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
                  <Link to="/notifications"><MenuItem className="footer">Mostra tutte</MenuItem></Link> 
                </Menu>

                <Tooltip title={user.displayName} placement="bottom">
                  <IconButton
                    className="more-btn"
                    aria-label="More"
                    aria-owns={moreAnchorEl ? 'more-menu' : null}
                    aria-haspopup="true"
                    onClick={this.onOpenMore}>
                    <Avatar className="avatar popIn reveal" src={user.photoURL} alt={user.displayName}>
                      {!user.photoURL && getInitials(user.displayName)}
                    </Avatar>
                    {!user.roles.editor && <div className="badge dot red" title="Modifiche disabilitate">{icon.lock()}</div>}
                  </IconButton>
                </Tooltip>
                <Menu
                  id="more-menu"
                  className="dropdown-menu"
                  anchorEl={moreAnchorEl}
                  onClick={this.onCloseMore}
                  open={Boolean(moreAnchorEl)}
                  onClose={this.onCloseMore}>
                  <MenuItem component={Link} to="/profile">Profilo</MenuItem>
                  <MenuItem component={Link} to={`/dashboard/${authid}`}>Dashboard</MenuItem>
                  <MenuItem onClick={signOut}>Esci</MenuItem>
                </Menu>
              </React.Fragment>
            : 
              <React.Fragment>
                <NavLink to="/login" className="btn flat">Accedi</NavLink>
                <NavLink to="/signup" className="btn primary">Registrati</NavLink>
              </React.Fragment>
            }
          </Toolbar>
        </AppBar>
        
        <ThemeProvider theme={darkTheme}>
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
                        <Typography variant="inherit">Amministrazione</Typography>
                      </MenuItem>
                    </NavLink>
                  }
                  <NavLink to={`/dashboard/${authid}/shelf`}>
                    <MenuItem>
                      <ListItemIcon>{icon.homeAccount()}</ListItemIcon>
                      <Typography variant="inherit">La mia libreria</Typography>
                    </MenuItem>
                  </NavLink>
                </React.Fragment>
              :
                <div className="auth-header-buttons">
                  <NavLink to="/login">
                    <MenuItem>
                      <ListItemIcon>{icon.loginVariant()}</ListItemIcon>
                      <Typography variant="inherit">Accedi</Typography>
                    </MenuItem>
                  </NavLink>
                  <NavLink to="/signup">
                    <MenuItem>
                      <ListItemIcon>{icon.accountPlus()}</ListItemIcon>
                      <Typography variant="inherit">Registrati</Typography>
                    </MenuItem>
                  </NavLink>
                </div>
              }
              <NavLink to="/" exact>
                <MenuItem>
                  <ListItemIcon>{icon.home()}</ListItemIcon>
                  <Typography variant="inherit">Home</Typography>
                </MenuItem>
              </NavLink>
              <NavLink to="/genres" exact>
                <MenuItem>
                  <ListItemIcon>{icon.libraryShelves()}</ListItemIcon>
                  <Typography variant="inherit">Generi</Typography>
                </MenuItem>
              </NavLink>
              <NavLink to="/authors" exact>
                <MenuItem>
                  <ListItemIcon>{icon.accountEdit()}</ListItemIcon>
                  <Typography variant="inherit">Autori</Typography>
                </MenuItem>
              </NavLink>
              <NavLink to="/donations" exact>
                <MenuItem>
                  <ListItemIcon>{icon.bitcoin()}</ListItemIcon>
                  <Typography variant="inherit">Donazioni</Typography>
                </MenuItem>
              </NavLink>

              <MenuItem disableRipple className="bottom-item">
                <div className="version">v {version}</div>
              </MenuItem>
              
            </nav>
          </Drawer>
        </ThemeProvider>
        
        <main>
          {children}
        </main>

        <Footer />

        <CookieBanner
          disableStyle
          message="Usiamo i cookie 🍪 Per saperne di più "
          buttonMessage="Accetto"
          link={<Link to="/cookie">clicca qui</Link>}
          dismissOnScrollThreshold={100}
          onAccept={() => {}}
          cookie="user-has-accepted-cookies" 
        />
      </div> 
    );
  }
}