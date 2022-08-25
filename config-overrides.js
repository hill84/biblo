const { addPostcssPlugins, useBabelRc, override, useEslintRc } = require('customize-cra');
const autoprefixer = require('autoprefixer');
const postcssCustomMedia = require('postcss-custom-media');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');

module.exports = override(
  useBabelRc(),
  useEslintRc(),
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