import React, { useEffect } from 'react';

const withScrollToTop = WrappedComponent => props => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <WrappedComponent {...props} />
  );
};

export default withScrollToTop;