// https://css-tricks.com/using-webp-images/
import imagemin from 'imagemin';
import webp from 'imagemin-webp';

const PNGImages = './src/images/*.png';
const JPEGImages = './src/images/*.jpg';

imagemin([PNGImages], {
  destination: './src/images',
  plugins: [webp({
    lossless: true,
  })]
});

imagemin([JPEGImages], {
  destination: './src/images',
  plugins: [webp({
    quality: 65,
  })]
});

// run 'node webp.js'