import React, { useCallback, useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import { enrichText } from '../config/shared';
import { boolType, numberType, stringType } from '../config/types';
import '../css/minifiableText.css';

const MinifiableText = props => {
  const { defaultMinified, forced, maxChars, rich, source, text, toggle } = props;
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

  const richText = enrichText(text);

  if (!text) return null;

  return (
    <>
      <span
        className={`minifiable ${minified ? 'minified' : 'expanded'}`}
        dangerouslySetInnerHTML={{ __html: rich ? richText : text }}
      />
      {source && (
        <span className="text-sm pull-right m-b-negative">
          <a href="https://it.wikipedia.org/wiki/Licenze_Creative_Commons" target="_blank" rel="noopener noreferrer">
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
  rich: boolType,
  source: stringType,
  text: stringType.isRequired,
  toggle: boolType
}

MinifiableText.defaultProps = {
  defaultMinified: null,
  forced: false,
  maxChars: 700,
  rich: false,
  source: null,
  toggle: false
}
 
export default MinifiableText;