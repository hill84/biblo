import React, { useEffect, useRef, useState, useCallback } from 'react';
import { boolType, numberType, stringType } from '../config/types';
import '../css/minifiableText.css';

const MinifiableText = props => {
  const is = useRef(true);
  const { maxChars, source, text, defaultMinified } = props;
  const [minified, setMinified] = useState(defaultMinified === false ? defaultMinified : (text && text.length > (maxChars || 700)));

  const minifyText = useCallback(() => {
    if (is.current) setMinified(text.length > maxChars);
  }, [maxChars, text]);

  useEffect(() => {
    minifyText();
  }, [minifyText]);

  useEffect(() => {
    if (is.current) setMinified(defaultMinified === false ? defaultMinified : (text && text.length > (maxChars || 700)));
  }, [maxChars, text, defaultMinified]);

  useEffect(() => () => {
    is.current = false;
  }, []);

  const onMinify = () => {
    if (is.current) setMinified(!minified); 
  };

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