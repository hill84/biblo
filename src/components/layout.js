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
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import CookieBanner from 'react-cookie-banner';
import { Link, NavLink } from 'react-router-dom';
import { version } from '../../package.json';
import { noteRef, notesRef, signOut } from '../config/firebase';
import icon from '../config/icons';
import { roles } from '../config/lists';
import { app, getInitials, hasRole } from '../config/shared';
import { darkTheme } from '../config/themes';
import { childrenType } from '../config/types';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/layout.css';
import logo from '../images/logo.svg';
import Footer from './footer';
import NoteMenuItem from './noteMenuItem';

const unsub = {
  fetchNotes: null,
  timer: null
};

const Layout = ({ children }) => {
  const { error, isAdmin, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [notes, setNotes] = useState(null);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const [notesAnchorEl, setNotesAnchorEl] = useState(null);
  const is = useRef(true);

  const fetchNotes = useCallback(() => {
    if (user) {
      const notes = [];
      roles.forEach(role => {
        if (hasRole(user, role)) {
          unsub.fetchNotes = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot(snap => {
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
          if (is.current) setNotes(notes);
        }
      }).catch(err => console.warn(err));
    } else if (is.current) setNotes(null);
  }, [user]);

  useEffect(() => {
    unsub.timer = setTimeout(() => {
      fetchNotes();
    }, 1000);
  }, [fetchNotes]);

  useEffect(() => {
    if (error) openSnackbar(error, 'error', 9000);
  }, [error, openSnackbar]);
  
  useEffect(() => () => {
    is.current = false;
    unsub.fetchNotes && unsub.fetchNotes();
    unsub.timer && clearTimeout(unsub.timer);
  }, []);

  const onToggleDrawer = () => setDrawerIsOpen(!drawerIsOpen);
  const onCloseDrawer = () => setDrawerIsOpen(false);

  const onOpenMore = e => setMoreAnchorEl(e.currentTarget);
  const onCloseMore = () => setMoreAnchorEl(null);

  const onOpenNotes = e => {
    setNotesAnchorEl(e.currentTarget);
    notes && notes.filter(note => note.read !== true && !note.role).forEach(note => {
      /* setNotes({ ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }); */
      noteRef(user.uid, note.nid).update({ read: true }).then().catch(err => console.warn(err));
    });
  }
  const onCloseNotes = () => setNotesAnchorEl(null);

  const toRead = useCallback(notes => notes?.filter(note => !note.read || note.role), []);

  return (
    <div id="layoutComponent" ref={is}>
      <div className="top-bar dark" position="static">
        <Toolbar className="toolbar">
          <Tooltip title="Menu" placement="bottom">
            <IconButton className="drawer-btn" aria-label="Menu" onClick={onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
          <Typography className="title" variant="h1" color="inherit">
            <Link to="/"><img src={logo} alt={app.name} /><sup>Beta</sup></Link>
          </Typography>
          {user ? (
            <>
              {isEditor && (
                <Tooltip title="Aggiungi libro" placement="bottom">
                  <IconButton
                    className="search-btn popIn reveal hide-xs"
                    component={NavLink} 
                    to="/new-book"
                    aria-label="New book">
                    {icon.plus}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Cerca libro" placement="bottom">
                <IconButton
                  className="search-btn popIn reveal delay1"
                  component={NavLink} 
                  to="/books/add"
                  aria-label="Search">
                  {icon.magnify}
                </IconButton>
              </Tooltip>
              <Tooltip title={`${notes ? toRead(notes).length : 0} notifiche`} placement="bottom">
                <IconButton
                  className="notes-btn popIn reveal delay2"
                  aria-label="Notifications"
                  aria-owns={notesAnchorEl ? 'notes-menu' : null}
                  aria-haspopup="true"
                  onClick={onOpenNotes}>
                  {icon.bell}
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
                {notes && toRead(notes).length ? (
                  toRead(notes).map((item, i) => (
                    <NoteMenuItem item={item} index={i} key={item.nid} animation />
                  ))
                ) : (
                  <MenuItem>
                    <div className="row">
                      <div className="col-auto">
                        <span className="icon">{icon.bellOff}</span>
                      </div>
                      <div className="col text">Non ci sono nuove notifiche</div>
                    </div>
                  </MenuItem>
                )}
                <Link to="/notifications"><MenuItem className="footer">Mostra tutte</MenuItem></Link> 
              </Menu>

              <Tooltip title="Gruppi" placement="bottom">
                <IconButton
                  className="groups-btn popIn reveal delay3 hide-xxs"
                  component={NavLink} 
                  to="/groups"
                  aria-label="Groups">
                  {icon.accountGroup}
                </IconButton>
              </Tooltip>

              <Tooltip title={user.displayName} placement="bottom">
                <IconButton
                  className="more-btn"
                  aria-label="More"
                  aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup="true"
                  onClick={onOpenMore}>
                  <Avatar className="avatar popIn reveal delay4" src={user.photoURL} alt={user.displayName}>
                    {!user.photoURL && getInitials(user.displayName)}
                  </Avatar>
                  {!isEditor && <div className="badge dot red" title="Modifiche disabilitate">{icon.lock}</div>}
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
                <MenuItem component={Link} to={`/dashboard/${user.uid}/shelf`}>La mia libreria</MenuItem>
                <MenuItem onClick={signOut}>Esci</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn rounded flat hide-xs">Accedi</NavLink>
              <NavLink to="/signup" className="btn rounded primary">Registrati</NavLink>
            </>
          )}
        </Toolbar>
      </div>
      
      <ThemeProvider theme={darkTheme}>
        <Drawer
          className="drawer"
          open={drawerIsOpen}
          onClick={onCloseDrawer}>
          <nav className="list">
            {user ? (
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
                {isAdmin && (
                  <NavLink to="/admin">
                    <MenuItem>
                      <ListItemIcon>{icon.gauge}</ListItemIcon>
                      <Typography variant="inherit">Amministrazione</Typography>
                    </MenuItem>
                  </NavLink>
                )}
                <NavLink to={`/dashboard/${user.uid}/shelf`}>
                  <MenuItem>
                    <ListItemIcon>{icon.bookshelf}</ListItemIcon>
                    <Typography variant="inherit">La mia libreria</Typography>
                  </MenuItem>
                </NavLink>
              </>
            ) : (
              <div className="auth-header-buttons">
                <NavLink to="/login">
                  <MenuItem>
                    <ListItemIcon>{icon.loginVariant}</ListItemIcon>
                    <Typography variant="inherit">Accedi</Typography>
                  </MenuItem>
                </NavLink>
                <NavLink to="/signup">
                  <MenuItem>
                    <ListItemIcon>{icon.accountPlus}</ListItemIcon>
                    <Typography variant="inherit">Registrati</Typography>
                  </MenuItem>
                </NavLink>
              </div>
            )}
            <NavLink to="/" exact>
              <MenuItem>
                <ListItemIcon>{icon.home}</ListItemIcon>
                <Typography variant="inherit">Home</Typography>
              </MenuItem>
            </NavLink>
            <NavLink to="/groups" exact>
              <MenuItem>
                <ListItemIcon>{icon.accountGroup}</ListItemIcon>
                <Typography variant="inherit">Gruppi <span className="badge sm rounded accent">New</span></Typography>
              </MenuItem>
            </NavLink>
            <NavLink to="/genres" exact>
              <MenuItem>
                <ListItemIcon>{icon.libraryShelves}</ListItemIcon>
                <Typography variant="inherit">Generi</Typography>
              </MenuItem>
            </NavLink>
            <NavLink to="/authors" exact>
              <MenuItem>
                <ListItemIcon>{icon.accountEdit}</ListItemIcon>
                <Typography variant="inherit">Autori</Typography>
              </MenuItem>
            </NavLink>
            {/* <NavLink to="/collections" exact>
              <MenuItem>
                <ListItemIcon>{icon.bookmarkMultiple}</ListItemIcon>
                <Typography variant="inherit">Collezioni</Typography>
              </MenuItem>
            </NavLink> */}
            <NavLink to="/donations" exact>
              <MenuItem>
                <ListItemIcon>{icon.heart}</ListItemIcon>
                <Typography variant="inherit">Donazioni</Typography>
              </MenuItem>
            </NavLink>
            {isAdmin && (
              <NavLink to="/icons" exact>
                <MenuItem>
                  <ListItemIcon>{icon.emoticon}</ListItemIcon>
                  <Typography variant="inherit">Icone</Typography>
                </MenuItem>
              </NavLink>
            )}

            <MenuItem disableRipple className="bottom-item">
              <div className="version">v {version}</div>
            </MenuItem>
            
          </nav>
        </Drawer>
      </ThemeProvider>
      
      <main>{children}</main>

      <Footer />

      <CookieBanner
        disableStyle
        message="🍪 Usiamo i "
        buttonMessage="Accetto"
        link={<Link to="/cookie">cookie</Link>}
        dismissOnScrollThreshold={100}
        onAccept={() => {}}
        cookie="user-has-accepted-cookies" 
      />
    </div>
  );
}

Layout.propTypes = {
  children: childrenType
}

Layout.defaultProps = {
  children: null
}
 
export default Layout;