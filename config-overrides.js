const { addPostcssPlugins, override } = require('customize-cra');
const autoprefixer = require('autoprefixer');
const postcssCustomMedia = require('postcss-custom-media');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');

module.exports = override(
  addPostcssPlugins([
    autoprefixer({}),
    postcssCustomMedia({}),
    postcssImport({}),
    postcssPresetEnv({
      stage: 0,
      features: {
        'nesting-rules': true
      }
    })
  ])
);