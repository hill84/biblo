import React from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import AccountCircle from 'material-ui/svg-icons/social/person';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom';

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
        <MenuItem primaryText="Sign out" />
    </IconMenu>
);

Logged.muiName = 'IconMenu';

export default class Layout extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            logged: false,
            drawer: false
        }
    }

    handleToggle = () => this.setState({drawer: !this.state.drawer});
    
    handleClose = () => this.setState({drawer: false});

    render(){
        return (
            <div id="layoutComponent">
                <AppBar 
                    position="static"
                    title="Delibris"
                    iconElementLeft={
                        <IconButton onClick={this.handleToggle}> 
                            {this.state.drawer ? <NavigationClose /> : <NavigationMenu />}
                        </IconButton>
                    }
                    iconElementRight={this.state.logged ? <Logged /> : <Login />}
                />
                <Drawer
                    docked={false}
                    open={this.state.drawer}
                    onRequestChange={(drawer) => this.setState({drawer})}
                >
                    <MenuItem onClick={this.handleClose}>Menu Item</MenuItem>
                    <MenuItem onClick={this.handleClose}>Menu Item 2</MenuItem>
                </Drawer>
                <div className="container">
                    {this.props.children}
                </div>
            </div>
        )
    }
}