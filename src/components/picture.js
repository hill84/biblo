import React from 'react';
import { stringType } from '../config/types';

const Picture = props => {
  return (
    <picture>
      {props.webp && <source srcSet={props.webp} type="image/webp" />}
      {props.jpeg && <source srcSet={props.jpeg} type="image/jpeg" />}
      {props.png && <source srcSet={props.png} type="image/png" />}
      <img src={props.jpg || props.png} alt={props.alt || ''} />
    </picture>
  );
}

Picture.propTypes = {
  alt: stringType,
  jpeg: stringType,
  png: stringType,
  webp: stringType
}

export default Picture;