import React from 'react';
import { AppBar, Avatar, CircularProgress, Dialog, Drawer, FlatButton, IconButton, IconMenu, MenuItem } from 'material-ui';
import { NavigationClose, NavigationMenu } from 'material-ui/svg-icons';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { Link, NavLink } from 'react-router-dom';
import { auth, uid } from '../config/firebase';
import { appName } from '../config/shared';
import { userType } from '../config/types';

export default class Layout extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            uid: uid,
            drawer: false,
            dialog: false
        }
    }
    
    toggleDrawer = () => this.setState({drawer: !this.state.drawer});
    closeDrawer = () => this.setState({drawer: false});

    openDialog = () => this.setState({dialog: true});
    closeDialog = () => this.setState({dialog: false});

    //logout = () => auth.signOut();

    render(props) {
        const { dialog, drawer, uid } = this.state;
        const { user } = this.props;

        return (
            <div id="layoutComponent">
                <AppBar 
                    id="appBarComponent"
                    position="static"
                    title={appName}
                    iconElementLeft={
                        <IconButton onClick={this.toggleDrawer}> 
                            {drawer ? <NavigationClose /> : <NavigationMenu />}
                        </IconButton>
                    }
                    iconElementRight={ 
                        user ? <Logged /> : <FlatButton label="Login" containerElement={<Link to="/login" />} /> 
                    }
                />
                
                <Drawer
                    docked={false}
                    open={drawer}
                    onRequestChange={drawer => this.setState({drawer})}>
                    <nav onClick={this.closeDrawer}>
                        {(user && uid) ? 
                            <div>
                                <NavLink to="/profile" className="auth-header">
                                    <div className="background" style={{backgroundImage: `url(${user.photoURL})`}} />
                                    <div className="user">
                                        {user.photoURL ? <Avatar src={user.photoURL} /> : <Avatar>{user.displayName && user.displayName.charAt(0)}</Avatar>}
                                        <div className="user-info">
                                            <div className="user-name">{user.displayName}</div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </NavLink>
                                <NavLink to={`/dashboard/${uid}`}><MenuItem>Dashboard</MenuItem></NavLink>
                            </div>
                        :
                            <div className="auth-header-buttons">
                                <NavLink to="/login"><MenuItem>Login</MenuItem></NavLink>
                                <NavLink to="/signup"><MenuItem>Signup</MenuItem></NavLink>
                            </div>
                            
                        }
                        <NavLink to="/" exact><MenuItem>Home</MenuItem></NavLink>
                    </nav>
                </Drawer>
                
                {this.props.children}
                
                <Dialog
                    contentClassName="dialog"
                    title="Dialog title"
                    open={dialog}
                    contentStyle={{width: '340px', maxWidth: '94%', textAlign: 'center'}}>
                    Some text
                    {this.props.loading && <div className="loader"><CircularProgress /></div>}
                </Dialog>
            </div> 
        )
    }
}

const logout = () => auth.signOut();

const Logged = props => (
    <IconMenu
        {...props}
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    >
        <Link to="/profile"><MenuItem primaryText="Profilo" /></Link>
        {/* <Link to="/dashboard"><MenuItem primaryText="Dashboard" /></Link> */}
        <MenuItem primaryText="Logout" onClick={logout} />
    </IconMenu>
);
Logged.muiName = 'IconMenu';

Layout.propTypes = {
    user: userType
}