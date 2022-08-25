import { DocumentData } from '@firebase/firestore-types';
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
import React, { FC, MouseEvent, useCallback, useContext, useEffect, useState } from 'react';
import CookieBanner from 'react-cookie-banner';
import { Link, NavLink } from 'react-router-dom';
import { version } from '../../package.json';
import { noteRef, notesRef, signOut } from '../config/firebase';
import icon from '../config/icons';
import { roles } from '../config/lists';
import { app, getInitials, hasRole } from '../config/shared';
import { darkTheme } from '../config/themes';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/layout.css';
import logo from '../images/logo.svg';
import { NoteModel, RolesType } from '../types';
import Footer from './footer';
import NoteMenuItem from './noteMenuItem';

let fetchNotesCanceler: null | (() => void) = null;
let timer: null | number = null;

const Layout: FC = ({ children }) => {
  const { error, isAdmin, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [notes, setNotes] = useState<NoteModel[]>([]);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);
  const [moreAnchorEl, setMoreAnchorEl] = useState<Element | null>(null);
  const [notesAnchorEl, setNotesAnchorEl] = useState<Element | null>(null);

  const fetchNotes = useCallback(() => {
    if (user) {
      const notes: NoteModel[] = [];
      roles.forEach((role: RolesType): void => {
        if (hasRole(user, role)) {
          fetchNotesCanceler = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot((snap: DocumentData): void => {
            if (!snap.empty) {
              snap.forEach((note: DocumentData): void => {
                notes.push({ ...note.data(), role });
              });
            }
          });
        }
      });
      notesRef(user.uid).orderBy('created_num', 'desc').limit(10).get().then((snap: DocumentData): void => {
        if (!snap.empty) {
          snap.forEach((note: DocumentData): void => {
            notes.push(note.data());
          });
          setNotes(notes);
        }
      }).catch((err: Error): void => console.warn(err));
    } else setNotes([]);
  }, [user]);

  useEffect(() => {
    timer = window.setTimeout(() => {
      fetchNotes();
    }, 1000);
  }, [fetchNotes]);

  useEffect(() => {
    if (error) openSnackbar(error, 'error', 9000);
  }, [error, openSnackbar]);
  
  useEffect(() => () => {
    fetchNotesCanceler?.();
    timer && clearTimeout(timer);
  }, []);

  const onToggleDrawer = (): void => setDrawerIsOpen(!drawerIsOpen);
  const onCloseDrawer = (): void => setDrawerIsOpen(false);

  const onOpenMore = (e: MouseEvent): void => setMoreAnchorEl(e.currentTarget);
  const onCloseMore = (): void => setMoreAnchorEl(null);

  const onOpenNotes = (e: MouseEvent): void => {
    setNotesAnchorEl(e.currentTarget);
    notes?.filter((note: NoteModel): boolean => note.read !== true && !note.role).forEach((note: NoteModel): void => {
      /* setNotes({ ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }); */
      if (user?.uid && note.nid) {
        noteRef(user.uid, note.nid).update({ read: true }).then().catch((err: Error): void => console.warn(err));
      }
    });
  };
  const onCloseNotes = (): void => setNotesAnchorEl(null);

  const toRead = useCallback((notes: NoteModel[]): NoteModel[] => notes?.filter(note => !note.read || note.role), []);

  return (
    <div id='layoutComponent'>
      <div className='top-bar dark'>
        <Toolbar className='toolbar'>
          <Tooltip title='Menu' placement='bottom'>
            <IconButton className='drawer-btn' aria-label='Menu' onClick={onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
          <Typography className='title' variant='h1' color='inherit'>
            <Link to='/'><img src={logo} alt={app.name} /><sup>Beta</sup></Link>
          </Typography>
          {user ? (
            <>
              {isEditor && (
                <Tooltip title='Aggiungi libro' placement='bottom'>
                  <IconButton
                    className='search-btn popIn reveal hide-xs'
                    component={NavLink} 
                    to='/new-book'
                    aria-label='New book'>
                    {icon.plus}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title='Cerca libro' placement='bottom'>
                <IconButton
                  className='search-btn popIn reveal delay1'
                  component={NavLink} 
                  to='/books/add'
                  aria-label='Search'>
                  {icon.magnify}
                </IconButton>
              </Tooltip>
              <Tooltip title={`${notes ? toRead(notes).length : 0} notifiche`} placement='bottom'>
                <IconButton
                  className='notes-btn popIn reveal delay2'
                  aria-label='Notifications'
                  // aria-owns={notesAnchorEl ? 'notes-menu' : null}
                  aria-haspopup='true'
                  onClick={onOpenNotes}>
                  {icon.bell}
                  {notes && toRead(notes).length ? <div className='badge dot'>{toRead(notes).length}</div> : null}
                </IconButton>
              </Tooltip>
              <Menu
                id='notes-menu'
                className='dropdown-menu notes'
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
                    <div className='row'>
                      <div className='col-auto'>
                        <span className='icon'>{icon.bellOff}</span>
                      </div>
                      <div className='col text'>Non ci sono nuove notifiche</div>
                    </div>
                  </MenuItem>
                )}
                <Link to='/notifications'><MenuItem className='footer'>Mostra tutte</MenuItem></Link> 
              </Menu>

              <Tooltip title='Gruppi' placement='bottom'>
                <IconButton
                  className='groups-btn popIn reveal delay3 hide-xxs'
                  component={NavLink} 
                  to='/groups'
                  aria-label='Groups'>
                  {icon.accountGroup}
                </IconButton>
              </Tooltip>

              <Tooltip title={user.displayName} placement='bottom'>
                <IconButton
                  className='more-btn'
                  aria-label='More'
                  // aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup='true'
                  onClick={onOpenMore}>
                  <Avatar className='avatar popIn reveal delay4' src={user.photoURL} alt={user.displayName}>
                    {!user.photoURL && getInitials(user.displayName)}
                  </Avatar>
                  {!isEditor && <div className='badge dot red' title='Modifiche disabilitate'>{icon.lock}</div>}
                </IconButton>
              </Tooltip>
              <Menu
                id='more-menu'
                className='dropdown-menu'
                anchorEl={moreAnchorEl}
                onClick={onCloseMore}
                open={Boolean(moreAnchorEl)}
                onClose={onCloseMore}>
                <MenuItem component={Link} to='/profile'>Profilo</MenuItem>
                <MenuItem component={Link} to={`/dashboard/${user.uid}/shelf`}>La mia libreria</MenuItem>
                <MenuItem onClick={signOut}>Esci</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <NavLink to='/login' className='btn rounded flat hide-xs'>Accedi</NavLink>
              <NavLink to='/signup' className='btn rounded primary'>Registrati</NavLink>
            </>
          )}
        </Toolbar>
      </div>
      
      <ThemeProvider theme={darkTheme}>
        <Drawer
          className='drawer'
          open={drawerIsOpen}
          onClick={onCloseDrawer}>
          <nav className='list'>
            {user ? (
              <>
                <NavLink to='/profile' className='auth-header'>
                  <div className='background' style={{ backgroundImage: `url(${user.photoURL})`, }} />
                  <div className='user'>
                    <Avatar className='avatar' src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                    <div className='user-info'>
                      <div className='user-name'>{user.displayName}</div>
                      <div className='user-email'>{user.email}</div>
                    </div>
                  </div>
                </NavLink>
                {isAdmin && (
                  <NavLink to='/admin'>
                    <MenuItem>
                      <ListItemIcon>{icon.gauge}</ListItemIcon>
                      <Typography variant='inherit'>Amministrazione</Typography>
                    </MenuItem>
                  </NavLink>
                )}
                <NavLink to={`/dashboard/${user.uid}/shelf`}>
                  <MenuItem>
                    <ListItemIcon>{icon.bookshelf}</ListItemIcon>
                    <Typography variant='inherit'>La mia libreria</Typography>
                  </MenuItem>
                </NavLink>
              </>
            ) : (
              <div className='auth-header-buttons'>
                <NavLink to='/login'>
                  <MenuItem>
                    <ListItemIcon>{icon.loginVariant}</ListItemIcon>
                    <Typography variant='inherit'>Accedi</Typography>
                  </MenuItem>
                </NavLink>
                <NavLink to='/signup'>
                  <MenuItem>
                    <ListItemIcon>{icon.accountPlus}</ListItemIcon>
                    <Typography variant='inherit'>Registrati</Typography>
                  </MenuItem>
                </NavLink>
              </div>
            )}
            <NavLink to='/' exact>
              <MenuItem>
                <ListItemIcon>{icon.home}</ListItemIcon>
                <Typography variant='inherit'>Home</Typography>
              </MenuItem>
            </NavLink>
            <NavLink to='/groups' exact>
              <MenuItem>
                <ListItemIcon>{icon.accountGroup}</ListItemIcon>
                <Typography variant='inherit'>Gruppi</Typography>
              </MenuItem>
            </NavLink>
            <NavLink to='/genres' exact>
              <MenuItem>
                <ListItemIcon>{icon.libraryShelves}</ListItemIcon>
                <Typography variant='inherit'>Generi</Typography>
              </MenuItem>
            </NavLink>
            <NavLink to='/authors' exact>
              <MenuItem>
                <ListItemIcon>{icon.accountEdit}</ListItemIcon>
                <Typography variant='inherit'>Autori</Typography>
              </MenuItem>
            </NavLink>
            {/* <NavLink to='/collections' exact>
              <MenuItem>
                <ListItemIcon>{icon.bookmarkMultiple}</ListItemIcon>
                <Typography variant='inherit'>Collezioni</Typography>
              </MenuItem>
            </NavLink> */}
            <NavLink to='/donations' exact>
              <MenuItem>
                <ListItemIcon>{icon.heart}</ListItemIcon>
                <Typography variant='inherit'>Donazioni</Typography>
              </MenuItem>
            </NavLink>
            {isAdmin && (
              <NavLink to='/icons' exact>
                <MenuItem>
                  <ListItemIcon>{icon.emoticon}</ListItemIcon>
                  <Typography variant='inherit'>Icone</Typography>
                </MenuItem>
              </NavLink>
            )}

            <MenuItem disableRipple className='bottom-item'>
              <div className='version'>v {version}</div>
            </MenuItem>
            
          </nav>
        </Drawer>
      </ThemeProvider>
      
      <main>{children}</main>

      <Footer />

      <CookieBanner
        disableStyle
        message='🍪 Usiamo i '
        buttonMessage='Accetto'
        link={<Link to='/cookie'>cookie</Link>}
        dismissOnScrollThreshold={100}
        onAccept={() => null}
        cookie='user-has-accepted-cookies' 
      />
    </div>
  );
};

export default Layout;