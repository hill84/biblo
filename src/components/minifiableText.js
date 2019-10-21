import React from 'react';
import { boolType, numberType, stringType } from '../config/types';

export default class MinifiableText extends React.Component {
	state = {
    isTextMinified: this.props.textMinified === false ? this.props.textMinified : (this.props.text && this.props.text.length > (this.props.maxChars || 700)),
    maxChars: this.props.maxChars
  }

  static propTypes = {
    textMinified: boolType,
    maxChars: numberType,
    text: stringType.isRequired,
    source: stringType
  }

  static defaultProps = {
    textMinified: null,
    maxChars: 700,
    source: null
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps, /* prevState */) {
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

  componentWillUnmount() {
    this._isMounted = false;
  }

  minifyText = () => {
    this.setState(prevState => ({ isTextMinified: this.props.text.length > prevState.maxChars }));
  }

  onMinify = () => {
    this.setState(prevState => ({ isTextMinified: !prevState.isTextMinified })); 
  }
  
	render() {
    const { isTextMinified } = this.state;
    const { text, source } = this.props;

    if (!text) return null;

		return (
      <>
        <span className={`minifiable ${isTextMinified ? 'minified' : 'expanded'}`}>{text}</span>
        {source && 
          <span className="text-sm pull-right m-b-negative">
            <a href="https://it.wikipedia.org/wiki/Licenze_Creative_Commons">
              <span className="show-sm">&copy;</span>
              <span className="hide-sm">CC BY-SA</span>
            </a>&nbsp;
            <a href={source} target="_blank" rel="noopener noreferrer">{source.indexOf('wikipedia') > -1 ? 'Wikipedia' : 'Fonte'}</a>
          </span>
        }
        {isTextMinified && <><br/><button type="button" className="link" onClick={this.onMinify}>Mostra tutto</button></>}
      </>
		);
	}
}