import React, { useEffect } from 'react';

/* eslint-disable react/display-name */
const withScrollToTop = WrappedComponent => props => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <WrappedComponent {...props} />
  );
};

export default withScrollToTop;