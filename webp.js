// https://css-tricks.com/using-webp-images/
const imagemin = require('imagemin');
const webp = require('imagemin-webp');

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