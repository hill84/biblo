import React, { useEffect, useState, useCallback } from 'react';
import { boolType, numberType, stringType } from '../config/types';
import '../css/minifiableText.css';

const MinifiableText = props => {
  const { defaultMinified, forced, maxChars, source, text, toggle } = props;
  const [minified, setMinified] = useState(defaultMinified === false ? defaultMinified : (text?.length > (maxChars || 700)));

  const minifyText = useCallback(() => {
    setMinified(text.length > maxChars);
  }, [maxChars, text]);

  useEffect(() => {
    minifyText();
  }, [minifyText]);

  useEffect(() => {
    setMinified(defaultMinified === false ? defaultMinified : (text?.length > (maxChars || 700)));
  }, [maxChars, text, defaultMinified]);

  const onMinify = () => setMinified(!minified);

  if (!text) return null;

  return (
    <>
      <span className={`minifiable ${minified ? 'minified' : 'expanded'}`}>{text}</span>
      {source && (
        <span className="text-sm pull-right m-b-negative">
          <a href="https://it.wikipedia.org/wiki/Licenze_Creative_Commons">
            <span className="show-sm">&copy;</span>
            <span className="hide-sm">CC BY-SA</span>
          </a>&nbsp;
          <a href={source} target="_blank" rel="noopener noreferrer">{source.includes('wikipedia') ? 'Wikipedia' : 'Fonte'}</a>
        </span>
      )}
      {((minified && !forced) || toggle) && <><br/><button type="button" className="link" onClick={onMinify}>{toggle && !minified ? 'Nascondi' : 'Mostra tutto'}</button></>}
    </>
  );
}

MinifiableText.propTypes = {
  defaultMinified: boolType,
  forced: boolType,
  maxChars: numberType,
  source: stringType,
  text: stringType.isRequired,
  toggle: boolType
}

MinifiableText.defaultProps = {
  defaultMinified: null,
  forced: false,
  maxChars: 700,
  source: null,
  toggle: false
}
 
export default MinifiableText;