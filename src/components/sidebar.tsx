import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { ThemeProvider } from '@material-ui/styles';
import type { FC } from 'react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import pjson from '../../package.json';
import icon from '../config/icons';
import { getInitials } from '../config/shared';
import { darkTheme } from '../config/themes';
import UserContext from '../context/userContext';
import '../css/layout.css';

interface SidebarProps {
  drawerIsOpen: boolean;
  onCloseDrawer: () => void;
}

const Sidebar: FC<SidebarProps> = ({
  drawerIsOpen,
  onCloseDrawer,
}: SidebarProps) => {
  const { isAdmin, user } = useContext(UserContext);
  const { t } = useTranslation(['common']);

  return (
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
                    <Typography variant='inherit'>{t('PAGE_ADMIN')}</Typography>
                  </MenuItem>
                </NavLink>
              )}
              <NavLink to={`/dashboard/${user.uid}/shelf`}>
                <MenuItem>
                  <ListItemIcon>{icon.bookshelf}</ListItemIcon>
                  <Typography variant='inherit'>{t('PAGE_DASHBOARD')}</Typography>
                </MenuItem>
              </NavLink>
            </>
          ) : (
            <div className='auth-header-buttons'>
              <NavLink to='/login'>
                <MenuItem>
                  <ListItemIcon>{icon.loginVariant}</ListItemIcon>
                  <Typography variant='inherit'>{t('PAGE_LOGIN')}</Typography>
                </MenuItem>
              </NavLink>
              <NavLink to='/signup'>
                <MenuItem>
                  <ListItemIcon>{icon.accountPlus}</ListItemIcon>
                  <Typography variant='inherit'>{t('PAGE_SIGNUP')}</Typography>
                </MenuItem>
              </NavLink>
            </div>
          )}
          <NavLink to='/' end>
            <MenuItem>
              <ListItemIcon>{icon.home}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_HOME')}</Typography>
            </MenuItem>
          </NavLink>
          <NavLink to='/groups' end>
            <MenuItem>
              <ListItemIcon>{icon.accountGroup}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_GROUPS')}</Typography>
            </MenuItem>
          </NavLink>
          <NavLink to='/genres' end>
            <MenuItem>
              <ListItemIcon>{icon.libraryShelves}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_GENRES')}</Typography>
            </MenuItem>
          </NavLink>
          <NavLink to='/authors' end>
            <MenuItem>
              <ListItemIcon>{icon.accountEdit}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_AUTHORS')}</Typography>
            </MenuItem>
          </NavLink>
          {/* <NavLink to='/collections' end>
            <MenuItem>
              <ListItemIcon>{icon.bookmarkMultiple}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_COLLECTIONS')}</Typography>
            </MenuItem>
          </NavLink> */}
          <NavLink to='/donations' end>
            <MenuItem>
              <ListItemIcon>{icon.heart}</ListItemIcon>
              <Typography variant='inherit'>{t('PAGE_DONATIONS')}</Typography>
            </MenuItem>
          </NavLink>
          {isAdmin && (
            <NavLink to='/icons' end>
              <MenuItem>
                <ListItemIcon>{icon.emoticon}</ListItemIcon>
                <Typography variant='inherit'>{t('PAGE_ICONS')}</Typography>
              </MenuItem>
            </NavLink>
          )}

          <MenuItem disableRipple className='bottom-item'>
            <div className='version'>v {pjson.version}</div>
          </MenuItem>

        </nav>
      </Drawer>
    </ThemeProvider>
  );
};

export default Sidebar;