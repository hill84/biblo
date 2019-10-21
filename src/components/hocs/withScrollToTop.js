import React from 'react';

const withScrollToTop = Component => {
  return class extends React.Component {
    componentDidMount() {
      window.scrollTo(0, 0);
    }
 
    render() {
      return <Component {...this.props} />
    }
  }
}

export default withScrollToTop;