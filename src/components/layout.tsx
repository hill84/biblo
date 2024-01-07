import type { FC } from 'react';
import { useContext, useEffect, useState } from 'react';
import CookieBanner from 'react-cookie-banner';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import '../css/layout.css';
import Footer from './footer';
import Header from './header';
import Sidebar from './sidebar';

const Layout: FC = ({ children }) => {
  const { error } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [drawerIsOpen, setDrawerIsOpen] = useState<boolean>(false);

  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (error) openSnackbar(error, 'error', 9000);
  }, [error, openSnackbar]);

  const onToggleDrawer = (): void => setDrawerIsOpen(prev => !prev);
  const onCloseDrawer = (): void => setDrawerIsOpen(false);

  return (
    <div id='layoutComponent'>
      <Header
        drawerIsOpen={drawerIsOpen}
        onToggleDrawer={onToggleDrawer}
      />
      
      <Sidebar
        drawerIsOpen={drawerIsOpen}
        onCloseDrawer={onCloseDrawer}
      />
      
      <main>{children}</main>

      <Footer />

      <CookieBanner
        disableStyle
        message={`🍪 ${t('WE_USE')} `}
        buttonMessage={t('ACTION_ACCEPT')}
        link={<Link to='/cookie'>{t('COOKIES').toLowerCase()}</Link>}
        dismissOnScrollThreshold={100}
        onAccept={() => null}
        cookie='user-has-accepted-cookies' 
      />
    </div>
  );
};

export default Layout;