const reactAppRewirePostcss = require('react-app-rewire-postcss');
const postcssPresetEnv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');
const postcssCustomMedia = require('postcss-custom-media');
const postcssImport = require('postcss-import');

module.exports = config => {
  reactAppRewirePostcss(config, {
    plugins: () => [
      autoprefixer({}),
      postcssImport({}),
      postcssCustomMedia({}),
      postcssPresetEnv({
        stage: 0,
        features: {
          'nesting-rules': true
        }
      })
    ]
  });

  return config;
};