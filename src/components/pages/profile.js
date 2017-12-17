import React from 'react';
//import { Avatar } from 'material-ui';

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render(props) {
		return (
			<div id="profileComponent">
				<h2>Profile</h2>
				<div className="card">
                    {/*<Avatar src={this.props.user.photoURL} />*/}
					<p>...</p>
				</div>
			</div>
		);
	}
}