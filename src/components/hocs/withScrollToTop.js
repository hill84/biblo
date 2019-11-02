import React, { Component } from 'react';

const withScrollToTop = WrappedComponent => {
  return class extends Component {
    componentDidMount() {
      window.scrollTo(0, 0);
    }
 
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

export default withScrollToTop;