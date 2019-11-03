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
import React, { useEffect, useRef, useState } from 'react';
import CookieBanner from 'react-cookie-banner';
import { Link, NavLink } from 'react-router-dom';
import { version } from '../../package.json';
import { authid, noteRef, notesRef, signOut } from '../config/firebase';
import icon from '../config/icons';
import { roles } from '../config/lists';
import { app, getInitials, hasRole, timeSince } from '../config/shared';
import { darkTheme } from '../config/themes';
import { childrenType, funcType, stringType, userType } from '../config/types';
import Footer from './footer';

const Layout = props => {
  const [state, setState] = useState({
    drawerIsOpen: false,
    moreAnchorEl: null,
    notes: null,
    notesAnchorEl: null
  });
  
  const { children, error, openSnackbar, user } = props;
  const { drawerIsOpen, moreAnchorEl, notes, notesAnchorEl } = state;
  const is = useRef(true);

  useEffect(() => {
    let unsubNotesFetch;

    const fetchNotes = () => {
      if (user) {
        const notes = [];
        roles.forEach(role => {
          if (hasRole(user, role)) {
            unsubNotesFetch = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot(snap => {
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
            if (is.current) setState(prevState => ({ ...prevState, notes }));
          }
        }).catch(err => console.warn(err));
      } else if (is.current) setState(prevState => ({ ...prevState, notes: null }));
    }

    const unsubTimer = setTimeout(() => {
      fetchNotes();
    }, 1000);

    return () => {
      is.current = false;
      unsubNotesFetch && unsubNotesFetch();
      unsubTimer && clearTimeout(unsubTimer);
    }
  }, [user]);

  useEffect(() => {
    if (error) openSnackbar(error, 'error', 9000);
  }, [error, openSnackbar]);

  const onToggleDrawer = () => setState(prevState => ({ ...prevState, drawerIsOpen: !prevState.drawerIsOpen }));
  const onCloseDrawer = () => setState(prevState => ({ ...prevState, drawerIsOpen: false }));

  const onOpenMore = e => {
    e.persist();
    setState(prevState => ({ ...prevState, moreAnchorEl: e.currentTarget }));
  }
  const onCloseMore = () => setState(prevState => ({ ...prevState, moreAnchorEl: null }));

  const onOpenNotes = e => {
    e.persist();
    setState(prevState => ({ ...prevState, notesAnchorEl: e.currentTarget }));
    notes && notes.filter(note => note.read !== true && !note.role).forEach(note => {
      /* setState(prevState => ({
        ...prevState,
        notes: { ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }
      })); */
      noteRef(user.uid, note.nid).update({ read: true }).then().catch(err => console.warn(err));
    });
  }
  const onCloseNotes = () => setState(prevState => ({ ...prevState, notesAnchorEl: null }));

  // const onOpenDialog = () => setState(prevState => ({ ...prevState, dialogIsOpen: true }));
  // const onCloseDialog = () => setState(prevState => ({ ...prevState, dialogIsOpen: false }));

  const toRead = notes => notes && notes.filter(note => !note.read || note.role);

  return (
    <div id="layoutComponent" ref={is}>
      <AppBar id="appBarComponent" className="dark" position="static">
        <Toolbar className="toolbar">
          <Tooltip title="Menu" placement="bottom">
            <IconButton className="drawer-btn" aria-label="Menu" onClick={onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
          <Typography className="title" variant="h6" color="inherit">
            <Link to="/">{app.name}<sup>Beta</sup></Link>
          </Typography>
          {user ? 
            <>
              {user.roles.admin && 
                <Tooltip title="Aggiungi libro" placement="bottom">
                  <IconButton
                    className="search-btn popIn reveal hide-xs"
                    component={Link} 
                    to="/new-book"
                    aria-label="New book">
                    {icon.plus()}
                  </IconButton>
                </Tooltip>
              }
              <Tooltip title="Cerca libro" placement="bottom">
                <IconButton
                  className="search-btn popIn reveal delay1"
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
                  onClick={onOpenNotes}>
                  {icon.bell()}
                  {notes && toRead(notes).length ? <div className="badge dot">{toRead(notes).length}</div> : null}
                </IconButton>
              </Tooltip>
              <Menu
                id="notes-menu"
                className="dropdown-menu notes"
                anchorEl={notesAnchorEl}
                onClick={onCloseNotes}
                open={Boolean(notesAnchorEl)}
                onClose={onCloseNotes}>
                {notes && toRead(notes).length ?
                  toRead(notes).map((item, i) => (
                    <MenuItem key={item.nid} style={{ animationDelay: `${(i + 1) / 10  }s`, }}> 
                      <div className="row">
                        <div className="col-auto">
                          {(item.photoURL || item.tag.indexOf('follow') > -1 || item.tag.indexOf('like') > -1) ?
                            <Link to={`/dashboard/${item.createdByUid}`} className="bubble">
                              <Avatar className="image avatar" alt={item.createdBy}>
                                {item.photoURL ? <img src={item.photoURL} alt="avatar" /> : getInitials(item.createdBy)}
                              </Avatar>
                            </Link>
                            : <span className="icon">{icon.bell()}</span>
                          }
                        </div>
                        <div className="col text">
                          <div dangerouslySetInnerHTML={{__html: item.text}} />
                        </div>
                        <div className="col-auto date">{timeSince(item.created_num)}</div>
                      </div>
                    </MenuItem>
                  ))
                  : 
                  <MenuItem>
                    <div className="row">
                      <div className="col-auto">
                        <span className="icon">{icon.bellOff()}</span>
                      </div>
                      <div className="col text">Non ci sono nuove notifiche</div>
                    </div>
                  </MenuItem>
                }
                <Link to="/notifications"><MenuItem className="footer">Mostra tutte</MenuItem></Link> 
              </Menu>

              <Tooltip title={user.displayName} placement="bottom">
                <IconButton
                  className="more-btn"
                  aria-label="More"
                  aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup="true"
                  onClick={onOpenMore}>
                  <Avatar className="avatar popIn reveal delay3" src={user.photoURL} alt={user.displayName}>
                    {!user.photoURL && getInitials(user.displayName)}
                  </Avatar>
                  {!user.roles.editor && <div className="badge dot red" title="Modifiche disabilitate">{icon.lock()}</div>}
                </IconButton>
              </Tooltip>
              <Menu
                id="more-menu"
                className="dropdown-menu"
                anchorEl={moreAnchorEl}
                onClick={onCloseMore}
                open={Boolean(moreAnchorEl)}
                onClose={onCloseMore}>
                <MenuItem component={Link} to="/profile">Profilo</MenuItem>
                <MenuItem component={Link} to={`/dashboard/${authid}`}>La mia libreria</MenuItem>
                <MenuItem onClick={signOut}>Esci</MenuItem>
              </Menu>
            </>
          : 
            <>
              <NavLink to="/login" className="btn flat hide-xs">Accedi</NavLink>
              <NavLink to="/signup" className="btn primary">Registrati</NavLink>
            </>
          }
        </Toolbar>
      </AppBar>
      
      <ThemeProvider theme={darkTheme}>
        <Drawer
          className="drawer"
          open={drawerIsOpen}
          onClick={onCloseDrawer}>
          <nav className="list">
            {user && authid ? 
              <>
                <NavLink to="/profile" className="auth-header">
                  <div className="background" style={{ backgroundImage: `url(${user.photoURL})`, }} />
                  <div className="user">
                    <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                    <div className="user-info">
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </NavLink>
                {user.roles.admin && 
                  <NavLink to="/admin">
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
              </>
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
                <ListItemIcon>{icon.heart()}</ListItemIcon>
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

Layout.propTypes = {
  children: childrenType,
  error: stringType,
  openSnackbar: funcType.isRequired,
  user: userType
}

Layout.defaultProps = {
  children: null,
  error: null,
  user: null
}
 
export default Layout;






