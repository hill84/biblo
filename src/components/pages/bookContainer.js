import React from 'react';
import Book from '../book';
import { UserContext } from '../../app';

const BookContainer = props => {
  return (
    <div id="BookContainerComponent">
      <UserContext.Consumer>
        {userValue => <Book bid={props.match.params.bid} user={userValue}/>}
      </UserContext.Consumer>
    </div>
  );
};

export default BookContainer;