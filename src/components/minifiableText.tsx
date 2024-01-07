import classnames from 'classnames';
import { sanitize } from 'dompurify';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { Link } from 'react-router-dom';
import { enrichText } from '../config/shared';
import '../css/minifiableText.css';

interface MinifiableTextProps {
  defaultMinified?: boolean;
  forced?: boolean;
  maxChars?: number;
  rich?: boolean;
  source?: string;
  text: string;
  toggle?: boolean;
}

const MinifiableText: FC<MinifiableTextProps> = ({
  defaultMinified,
  forced = false,
  maxChars = 700,
  rich = false,
  source,
  text = '',
  toggle = false,
}: MinifiableTextProps) => {
  const [minified, setMinified] = useState<boolean>(defaultMinified === false ? defaultMinified : (text.length > (maxChars || 700)));

  const { t } = useTranslation(['common']);

  const minifyText = useCallback((): void => setMinified(text.length > maxChars), [maxChars, text]);

  useEffect(() => {
    minifyText();
  }, [minifyText]);

  useEffect(() => {
    setMinified(defaultMinified === false ? defaultMinified : (text.length > (maxChars || 700)));
  }, [maxChars, text, defaultMinified]);

  const sanitizedHtml = useMemo((): string => sanitize(rich ? enrichText(text) : text), [rich, text]);

  if (!text) return null;

  const onMinify = (): void => setMinified(minified => !minified);

  return (
    <>
      <span
        className={classnames('minifiable', minified ? 'minified' : 'expanded')}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      {source && (
        <span className='text-sm pull-right m-b-negative'>
          <a href='https://it.wikipedia.org/wiki/Licenze_Creative_Commons' target='_blank' rel='noopener noreferrer'>
            <span className='show-sm'>&copy;</span>
            <span className='hide-sm'>CC BY-SA</span>
          </a>&nbsp;
          <a href={source} target='_blank' rel='noopener noreferrer'>{source.includes('wikipedia') ? 'Wikipedia' : 'Fonte'}</a>
        </span>
      )}
      {((minified && !forced) || toggle) && (
        <>
          <br/>
          <button type='button' className='link' onClick={onMinify}>
            {t(toggle && !minified ? 'ACTION_HIDE' : 'ACTION_SHOW_ALL')}
          </button>
        </>
      )}
    </>
  );
};

export default MinifiableText;