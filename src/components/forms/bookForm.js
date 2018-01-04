import React from 'react';
import PropTypes from 'prop-types';

export default class BookForm extends React.Component {
	constructor() {
		super();
		this.state = {}
	}
	
	render() {
		return (
			<div id="BookFormComponent">
				...
			</div>
		);
	}
}

Shelf.propTypes = {
  shelf: PropTypes.arrayOf(
    PropTypes.shape({
      ISBN_num: PropTypes.number,
      title: PropTypes.string,
      subtitle: PropTypes.string,
      authors: PropTypes.arrayOf(PropTypes.string),
      format: PropTypes.string,
      pages_num: PropTypes.number,
      publisher: PropTypes.string,
      publication: PropTypes.string,
      genres: PropTypes.arrayOf(PropTypes.string),
      rating_num: PropTypes.number,
      reviewTitle: PropTypes.string,
      review: PropTypes.string,
      status: PropTypes.string, //reading, read, toRead, abandoned, reference
      start: PropTypes.string,
      end: PropTypes.string
    })
  )
}