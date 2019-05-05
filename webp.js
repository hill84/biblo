// https://css-tricks.com/using-webp-images/

var imagemin = require("imagemin"),    // The imagemin module.
  webp = require("imagemin-webp"),   // imagemin's WebP plugin.
  outputFolder = "./src/images",            // Output folder
  PNGImages = "./src/images/*.png",         // PNG images
  JPEGImages = "./src/images/*.jpg";        // JPEG images

imagemin([PNGImages], outputFolder, {
  plugins: [webp({
    lossless: true
  })]
});

imagemin([JPEGImages], outputFolder, {
  plugins: [webp({
    quality: 65
  })]
});

// run "node webp.js"