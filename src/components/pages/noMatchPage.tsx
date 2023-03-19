import type { FC } from 'react';
import type { RouteComponentProps } from 'react-router';
import NoMatch from '../noMatch';

const NoMatchPage: FC<RouteComponentProps> = ({ history, location }: RouteComponentProps) => (
  <NoMatch history={history} location={location} />
);

export default NoMatchPage;