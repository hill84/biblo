import React from 'react';
import { boolType, numberType, stringType } from '../config/types';

export default class MinifiableText extends React.Component {
	state = {
    isTextMinified: this.props.textMinified === false ? this.props.textMinified : (this.props.text && this.props.text.length > (this.props.maxChars || 700)),
    maxChars: this.props.maxChars || 700,
    text: this.props.text
  }

  static propTypes = {
    textMinified: boolType,
    maxChars: numberType,
    text: stringType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.text !== state.text) { return { text: props.text }}
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.text && this.state.text.length !== prevState.text.length) {
      if (this._isMounted) {
        this.minifyText();
      }
    }
    if (this.props.textMinified !== prevProps.textMinified) {
      if (this._isMounted) {
        this.setState({
          isTextMinified: this.props.textMinified === false ? this.props.textMinified : (this.props.text && this.props.text.length > (this.props.maxChars || 700))
        });
      }
    }
  }

  minifyText = () => {
    this.setState({ isTextMinified: this.state.text.length > this.state.maxChars });
  }

  onMinify = () => {
    this.setState(prevState => ({ isTextMinified: !prevState.isTextMinified })); 
  }
  
	render() {
    const { isTextMinified, text } = this.state;

    if (!text) return null;

		return (
      <React.Fragment>
        <span className={`minifiable ${isTextMinified ? 'minified' : 'expanded'}`}>{text}</span>
        {isTextMinified && <React.Fragment><br/><button type="button" className="link" onClick={this.onMinify}>Mostra tutto</button></React.Fragment>}
      </React.Fragment>
		);
	}
}