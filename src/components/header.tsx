import type { DocumentData } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import NavigationClose from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import type { FC, MouseEvent } from 'react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { noteRef, notesRef, signOut } from '../config/firebase';
import icon from '../config/icons';
import { roles } from '../config/lists';
import { app, getInitials, hasRole } from '../config/shared';
import UserContext from '../context/userContext';
import '../css/layout.css';
import logo from '../images/logo.svg';
import type { NoteModel, RolesType } from '../types';
import NoteMenuItem from './noteMenuItem';

let fetchNotesCanceler: null | (() => void) = null;
let timer: null | number = null;

interface HeaderProps {
  drawerIsOpen: boolean;
  onToggleDrawer: () => void;
}

const Header: FC<HeaderProps> = ({
  drawerIsOpen,
  onToggleDrawer,
}: HeaderProps) => {
  const { isEditor, user } = useContext(UserContext);
  const [notes, setNotes] = useState<NoteModel[]>([]);
  const [moreAnchorEl, setMoreAnchorEl] = useState<Element | null>(null);
  const [notesAnchorEl, setNotesAnchorEl] = useState<Element | null>(null);

  const { t } = useTranslation(['common']);

  const fetchNotes = useCallback(() => {
    if (!user) return;
    const notes: NoteModel[] = [];
    roles.forEach((role: RolesType): void => {
      if (!hasRole(user, role)) return;
      fetchNotesCanceler = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot((snap: DocumentData): void => {
        if (snap.empty) return;
        snap.forEach((note: DocumentData): void => {
          notes.push({ ...note.data(), role });
        });
      });
    });
    notesRef(user.uid).orderBy('created_num', 'desc').limit(10).get().then((snap: DocumentData): void => {
      if (snap.empty) return;
      snap.forEach((note: DocumentData): void => {
        notes.push(note.data());
      });
      setNotes(notes);
    }).catch((err: Error): void => console.warn(err));
  }, [user]);

  useEffect(() => {
    timer = window.setTimeout(() => {
      fetchNotes();
    }, 1000);
  }, [fetchNotes]);
  
  useEffect(() => () => {
    fetchNotesCanceler?.();
    timer && clearTimeout(timer);
  }, []);

  const onOpenMore = (e: MouseEvent): void => setMoreAnchorEl(e.currentTarget);
  const onCloseMore = (): void => setMoreAnchorEl(null);

  const onOpenNotes = (e: MouseEvent): void => {
    setNotesAnchorEl(e.currentTarget);
    notes?.filter((note: NoteModel): boolean => note.read !== true && !note.role).forEach((note: NoteModel): void => {
      /* setNotes({ ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }); */
      if (!user?.uid || !note.nid) return;
      noteRef(user.uid, note.nid).update({ read: true }).then().catch((err: Error): void => console.warn(err));
    });
  };
  const onCloseNotes = (): void => setNotesAnchorEl(null);

  const toRead = useCallback((notes: NoteModel[]): NoteModel[] => {
    return notes?.filter((note: NoteModel): boolean => Boolean(!note.read || note.role));
  }, []);

  return (
    <div className='top-bar dark'>
      <Toolbar className='toolbar'>
        <Tooltip title='Menu' placement='bottom'>
          <IconButton className='drawer-btn' aria-label='Menu' onClick={onToggleDrawer}> 
            {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
          </IconButton>
        </Tooltip>
        <Typography className='title' variant='h1' color='inherit'>
          <Link to='/'>
            <img src={logo} alt={app.name} /><sup>Beta</sup>
          </Link>
        </Typography>
        {user ? (
          <>
            {isEditor && (
              <Tooltip title={t('ACTION_ADD_BOOK')} placement='bottom'>
                <IconButton
                  className='search-btn popIn reveal hide-xs'
                  component={NavLink} 
                  to='/new-book'
                  aria-label='New book'>
                  {icon.plus}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={t('ACTION_SEARCH_BOOK')} placement='bottom'>
              <IconButton
                className='search-btn popIn reveal delay1'
                component={NavLink} 
                to='/books/add'
                aria-label='Search'>
                {icon.magnify}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('NOTIFICATIONS_COUNT', { count: notes ? toRead(notes).length : 0 })} placement='bottom'>
              <IconButton
                className='notes-btn popIn reveal delay2'
                aria-label='Notifications'
                // aria-owns={notesAnchorEl ? 'notes-menu' : null}
                aria-haspopup='true'
                onClick={onOpenNotes}>
                {icon.bell}
                {Boolean(notes && toRead(notes).length) && (
                  <div className='badge dot'>
                    {toRead(notes).length}
                  </div>
                )}
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
                    <div className='col text'>
                      {t('NO_NEW_NOTIFICATIONS')}
                    </div>
                  </div>
                </MenuItem>
              )}
              <Link to='/notifications'>
                <MenuItem className='footer'>
                  {t('ACTION_SHOW_ALL_female')}
                </MenuItem>
              </Link> 
            </Menu>

            <Tooltip title={t('PAGE_GROUPS')} placement='bottom'>
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
                {!isEditor && (
                  <div className='badge dot red' title={t('EDIT_DISABLED')}>
                    {icon.lock}
                  </div>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              id='more-menu'
              className='dropdown-menu'
              anchorEl={moreAnchorEl}
              onClick={onCloseMore}
              open={Boolean(moreAnchorEl)}
              onClose={onCloseMore}>
              <MenuItem component={Link} to='/profile'>
                <ListItemIcon>{icon.account}</ListItemIcon> {t('PAGE_PROFILE')}
              </MenuItem>
              <MenuItem component={Link} to={`/dashboard/${user.uid}/shelf`}>
                <ListItemIcon>{icon.bookshelf}</ListItemIcon> {t('PAGE_DASHBOARD')}
              </MenuItem>
              <MenuItem onClick={signOut}>
                <ListItemIcon>{icon.logoutVariant}</ListItemIcon> {t('ACTION_LOGOUT')}
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <NavLink to='/login' className='btn rounded flat hide-xs'>{t('PAGE_LOGIN')}</NavLink>
            <NavLink to='/signup' className='btn rounded primary'>{t('PAGE_SIGNUP')}</NavLink>
          </>
        )}
      </Toolbar>
    </div>
  );
};

export default Header;