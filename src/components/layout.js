import React from 'react';
import { AppBar, Drawer, Avatar, MenuItem, IconButton, FlatButton, /*IconMenu,*/ Dialog, CircularProgress } from 'material-ui';
import { /*MoreVertIcon,*/ NavigationMenu, NavigationClose } from 'material-ui/svg-icons';
import { NavLink, Link, Redirect } from 'react-router-dom';
import { auth } from '../config/firebase.js';

export default class Layout extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            drawer: false,
            dialog: false
        }
    }

    toggleDrawer = () => this.setState({drawer: !this.state.drawer});
    closeDrawer = () => this.setState({drawer: false});

    openDialog = () => this.setState({dialog: true});
    closeDialog = () => this.setState({dialog: false});

    logout = () => auth.signOut();

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
                    iconElementRight={
                        this.props.user ? (
                            /*
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                            >
                                <MenuItem primaryText="Refresh" />
                                <MenuItem primaryText="Help" />
                                <MenuItem primaryText="Log out" onClick={this.logout} />
                            </IconMenu> 
                            */
                            <FlatButton label="Logout" onClick={this.logout} />
                        ) : (
                            <FlatButton label="Login" containerElement={<Link to="/login" />} />
                        )
                    }
                />
                
                <Drawer
                    docked={false}
                    open={this.state.drawer}
                    onRequestChange={(drawer) => this.setState({drawer})}>
                    <nav onClick={this.closeDrawer}>
                        {this.props.user ? ( 
                            <NavLink to="/profile" className="auth-header">
                                <div className="background" style={{backgroundImage: `url(${this.props.user.photoURL})`}} />
                                <div className="user">
                                    <Avatar src={this.props.user.photoURL} />
                                    <div className="user-info">
                                        <div className="user-name">{this.props.user.displayName}</div>
                                        <div className="user-email">{this.props.user.email}</div>
                                    </div>
                                </div>
                            </NavLink>
                        ) : (
                            <div className="auth-header-buttons">
                                <MenuItem><NavLink to="/login">Login</NavLink></MenuItem> 
                                <MenuItem><NavLink to="/signup">Signup</NavLink></MenuItem>
                            </div>
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
                    title="Dialog title"
                    open={this.state.dialog}
                    contentStyle={{width: '340px', maxWidth: '94%', textAlign: 'center'}}>
                    Some text
                    {this.props.loading ? <div className="loader"><CircularProgress /></div> : ''}
                </Dialog>
            </div> 
        )
    }
}