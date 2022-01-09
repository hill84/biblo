import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';
import '../../css/bookContainer.css';
import Book from '../book';

type BookContainerProps = RouteComponentProps<MatchParams>;

interface MatchParams {
  bid: string;
}

const BookContainer: FC<BookContainerProps> = ({
  history,
  location,
  match
}: BookContainerProps) =>  (
  <div id='bookContainerComponent'>
    <Book 
      bid={match.params.bid}
      history={history}
      location={location}
    />
  </div>
);

export default BookContainer;