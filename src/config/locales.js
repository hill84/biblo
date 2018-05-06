import areIntlLocalesSupported from 'intl-locales-supported';

export let DateTimeFormat;

if (areIntlLocalesSupported(['it'])) {
  DateTimeFormat = global.Intl.DateTimeFormat;
} else {
  const IntlPolyfill = require('intl');
  DateTimeFormat = IntlPolyfill.DateTimeFormat;
  require('intl/locale-data/jsonp/it');
}