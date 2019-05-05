import React from 'react';
import { boolType, numberType, stringType } from '../config/types';

export default class MinifiableText extends React.Component {
	state = {
    isTextMinified: this.props.textMinified === false ? this.props.textMinified : (this.props.text && this.props.text.length > (this.props.maxChars || 700)),
    maxChars: this.props.maxChars || 700
  }

  static propTypes = {
    textMinified: boolType,
    maxChars: numberType,
    text: stringType.isRequired,
    source: stringType
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.text && this.props.text.length !== prevProps.text.length) {
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
    this.setState({ isTextMinified: this.props.text.length > this.state.maxChars });
  }

  onMinify = () => {
    this.setState(prevState => ({ isTextMinified: !prevState.isTextMinified })); 
  }
  
	render() {
    const { isTextMinified } = this.state;
    const { text, source } = this.props;

    if (!text) return null;

		return (
      <React.Fragment>
        <span className={`minifiable ${isTextMinified ? 'minified' : 'expanded'}`}>{text}</span>
        {source && <a href={source} target="_blank" rel="noopener noreferrer" className="text-sm pull-right">{source.indexOf('wikipedia') > -1 ? 'Wikipedia' : 'Fonte'}</a>}
        {isTextMinified && <React.Fragment><br/><button type="button" className="link" onClick={this.onMinify}>Mostra tutto</button></React.Fragment>}
      </React.Fragment>
		);
	}
}