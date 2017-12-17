import React from 'react';
import { AppBar, Drawer, Avatar, MenuItem, IconButton, FlatButton, IconMenu, Dialog, CircularProgress } from 'material-ui';
import { MoreVertIcon, NavigationMenu, NavigationClose } from 'material-ui/svg-icons';
import { NavLink, Link } from 'react-router-dom';
import LoginForm from './forms/loginForm';
/*
const Login = (props) => (
    <FlatButton {...props} label="Login" containerElement={<Link to="/login" />} />
);
Login.muiName = 'FlatButton';

const Logged = (props) => (
    <IconMenu
        {...props}
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    >
        <MenuItem primaryText="Refresh" />
        <MenuItem primaryText="Help" />
        <MenuItem primaryText="Log out" onClick={this.props.logout} />
    </IconMenu>
);
Logged.muiName = 'IconMenu';
*/
export default class Layout extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            drawer: false,
            authDialog: false
        }
    }

    toggleDrawer = () => this.setState({drawer: !this.state.drawer});
    closeDrawer = () => this.setState({drawer: false});

    openAuthDialog = () => this.setState({authDialog: true});
    closeAuthDialog = () => this.setState({authDialog: false});

    render(props) {
        return (
            <div id="layoutComponent">
                <AppBar 
                    id="appBarComponent"
                    position="static"
                    title="Delibris"
                    iconElementLeft={
                        <IconButton onClick={this.toggleDrawer}> 
                            {this.state.drawer ? <NavigationClose /> : <NavigationMenu />}
                        </IconButton>
                    }
                    iconElementRight={this.props.user ? (
                        <FlatButton label="Logout" onClick={this.props.logout} /> 
                    ) : (
                        <FlatButton label="Login" onClick={this.openAuthDialog} />
                    )}
                />
                
                <Drawer
                    docked={false}
                    open={this.state.drawer}
                    onRequestChange={(drawer) => this.setState({drawer})}>
                    <nav onClick={this.closeDrawer}>
                        {this.props.user ? ( 
                            <NavLink to="/profile" className="auth-header">
                                <div className="background" style={{backgroundImage: `url(${this.props.user.photoURL}})`}} />
                                <div className="user">
                                    <Avatar src={this.props.user.photoURL} />
                                    <div className="user-info">
                                        <div className="user-name">{this.props.user.displayName}</div>
                                        <div className="user-email">{this.props.user.email}</div>
                                    </div>
                                </div>
                            </NavLink>
                        ) : (
                            <MenuItem><NavLink to="/login">Login</NavLink></MenuItem> 
                        )}
                        <MenuItem><NavLink to="/">Home</NavLink></MenuItem>
                        <MenuItem><NavLink to="/dashboard">Dashboard</NavLink></MenuItem>
                    </nav>
                </Drawer>
                
                <div className="container">
                    {this.props.children}
                </div>
                
                <Dialog
                    contentClassName="dialog"
                    title="Accedi"
                    open={this.state.authDialog}
                    contentStyle={{width: '340px', maxWidth: '94%', textAlign: 'center'}}>
                    <LoginForm 
                        googleAuth={this.props.googleAuth} 
                        facebookAuth={this.props.facebookAuth} 
                        twitterAuth={this.props.twitterAuth} 
                        closeAuthDialog={this.closeAuthDialog} 
                    />
                    {this.props.loading ? <div className="loader"><CircularProgress /></div> : ''}
                </Dialog>
            </div> 
        )
    }
}