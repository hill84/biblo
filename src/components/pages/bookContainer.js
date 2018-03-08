import React from 'react';
import { stringType, userType } from '../../config/types';
import Book from '../book';

const BookContainer = props => {
  return (
    <div id="BookContainerComponent">
      <Book bid={props.match.params.bid} uid={props.uid} user={props.user} />
    </div>
  );
};

export default BookContainer;

BookContainer.propTypes = {
	uid: stringType,
	user: userType
}