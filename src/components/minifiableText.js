import React, { useEffect, useRef, useState } from 'react';
import { boolType, numberType, stringType } from '../config/types';

const MinifiableText = props => {
  const [minified, setMinified] = useState(props.defaultMinified === false ? props.defaultMinified : (props.text && props.text.length > (props.maxChars || 700)));

  const is = useRef(true);
  const { maxChars, source, text, defaultMinified } = props;

  useEffect(() => {
    if (is.current) setMinified(prevState => text.length > prevState.maxChars);
  }, [text]);

  useEffect(() => {
    if (is.current) setMinified(defaultMinified === false ? defaultMinified : (text && text.length > (maxChars || 700)));
  }, [maxChars, text, defaultMinified]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onMinify = () => {
    if (is.current) setMinified(prevState => !prevState.minified); 
  }

  if (!text) return null;

  return (
    <>
      <span className={`minifiable ${minified ? 'minified' : 'expanded'}`} ref={is}>{text}</span>
      {source && 
        <span className="text-sm pull-right m-b-negative">
          <a href="https://it.wikipedia.org/wiki/Licenze_Creative_Commons">
            <span className="show-sm">&copy;</span>
            <span className="hide-sm">CC BY-SA</span>
          </a>&nbsp;
          <a href={source} target="_blank" rel="noopener noreferrer">{source.indexOf('wikipedia') > -1 ? 'Wikipedia' : 'Fonte'}</a>
        </span>
      }
      {minified && <><br/><button type="button" className="link" onClick={onMinify}>Mostra tutto</button></>}
    </>
  );
}

MinifiableText.propTypes = {
  defaultMinified: boolType,
  maxChars: numberType,
  text: stringType.isRequired,
  source: stringType
}

MinifiableText.defaultProps = {
  defaultMinified: null,
  maxChars: 700,
  source: null
}
 
export default MinifiableText;