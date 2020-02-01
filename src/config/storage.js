export const ifLocalStorage = callback => {
  if (typeof localStorage !== 'undefined') {
    // console.log('localStorage is defined');
    if (callback && typeof callback === 'function') {
      // console.log('callback is a function')
      try {
        return callback();
      } catch(err) {
        // console.log('error', err);
        return null;
      }
    } else {
      // console.log('callback error');
      return null;
    }
  } else {
    // console.log('localStorage is not defined');
    return null;
  }
};

export const incipitKey = {
  fontBig: 'incipit_fontBig',
  themeDark: 'incipit_themeDark'
};

export const uidKey = 'uid';

export const themeKey = 'theme'; // 'dark' | 'light' | 'mixed'

export const recommendationQuoteKey = 'recommendation_quote';

export const userBooksKey = {
  books: 'userBooks_books',
  timestamp: 'userBooks_timestamp'
};