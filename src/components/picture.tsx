import React, { FC } from 'react';

interface PictureProps {
  alt?: string;
  jpeg?: string;
  jpg?: string;
  png?: string;
  webp?: string;
}

const Picture: FC<PictureProps> = ({ alt = '', jpeg, jpg, png, webp }: PictureProps) => (
  <picture>
    {webp && <source srcSet={webp} type='image/webp' />}
    {jpeg && <source srcSet={jpeg} type='image/jpeg' />}
    {png && <source srcSet={png} type='image/png' />}
    <img src={jpg || png} alt={alt} />
  </picture>
);

export default Picture;