import React from 'react';
import { userType } from '../../config/types';
import Book from '../book';

const BookContainer = props => {
  return (
    <div id="BookContainerComponent">
      <Book bid={props.match.params.bid} user={props.user} />
    </div>
  );
};

export default BookContainer;

BookContainer.propTypes = {
	user: userType
}