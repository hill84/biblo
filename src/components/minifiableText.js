import React from 'react';
import { numberType, stringType } from '../config/types';

export default class MinifiableText extends React.Component {
	state = {
    isTextMinified: this.props.text && this.props.text.length > (this.props.maxChars || 700) ? true : false,
    maxChars: this.props.maxChars || 700,
    text: this.props.text
  }

  static propTypes = {
    maxChars: numberType,
    text: stringType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.text !== state.text) { return { text: props.text }}
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.text && this.state.text.length !== prevState.text.length){
      this.minifyText();
    }
  }

  minifyText = () => {
    this.setState({ isTextMinified: this.state.text.length > this.state.maxChars ? true : false });
  }

  onMinify = () => {
    this.setState(prevState => ({ isTextMinified: !prevState.isTextMinified })); 
  }
  
	render() {
    const { isTextMinified, text } = this.state;

    if (!text) return null;

		return (
      <React.Fragment>
        <p className={`minifiable ${isTextMinified ? 'minified' : 'expanded'}`}>{text}</p>
        {isTextMinified && <p><button className="link" onClick={this.onMinify}>Mostra tutto</button></p>}
      </React.Fragment>
		);
	}
}