import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';
import NoMatch from '../noMatch';

const NoMatchPage: FC<RouteComponentProps> = ({ history, location }: RouteComponentProps) => (
  <NoMatch history={history} location={location} />
);

export default NoMatchPage;