import React from 'react';
import { stringType } from '../config/types';

const Picture = ({ alt, jpeg, jpg, png, webp }) => (
  <picture>
    {webp && <source srcSet={webp} type="image/webp" />}
    {jpeg && <source srcSet={jpeg} type="image/jpeg" />}
    {png && <source srcSet={png} type="image/png" />}
    <img src={jpg || png} alt={alt} />
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