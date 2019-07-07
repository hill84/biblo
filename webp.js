// https://css-tricks.com/using-webp-images/

var imagemin = require("imagemin"),   // The imagemin module.
  webp = require("imagemin-webp"),    // imagemin's WebP plugin.
  PNGImages = "./src/images/*.png",   // PNG images
  JPEGImages = "./src/images/*.jpg";  // JPEG images

imagemin([PNGImages], {
  destination: "./src/images",
  plugins: [webp({
    lossless: true,
  })]
});

imagemin([JPEGImages], {
  destination: "./src/images",
  plugins: [webp({
    quality: 65,
  })]
});

// run "node webp.js"