import React from 'react';
import { stringType } from '../config/types';

const Picture = props => (
  <picture>
    {props.webp && <source srcSet={props.webp} type="image/webp" />}
    {props.jpeg && <source srcSet={props.jpeg} type="image/jpeg" />}
    {props.png && <source srcSet={props.png} type="image/png" />}
    <img src={props.jpg || props.png} alt={props.alt} />
  </picture>
);

Picture.propTypes = {
  alt: stringType,
  jpeg: stringType,
  jpg: stringType,
  png: stringType,
  webp: stringType
}

Picture.defaultProps = {
  alt: '',
  jpeg: null,
  jpg: null,
  png: null,
  webp: null
}

export default Picture;