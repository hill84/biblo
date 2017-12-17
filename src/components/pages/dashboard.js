import React from 'react';

export default class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	render() {
		return (
			<div id="dashboardComponent">
				<h2>Dashboard</h2>
				<div className="card">
					<p>...</p>
				</div>
			</div>
		);
	}
}