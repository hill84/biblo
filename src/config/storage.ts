export const ifLocalStorage = (callback: Function): Function | null => {
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

export const incipitKey: Record<string, string> = {
  fontBig: 'incipit_fontBig',
  themeDark: 'incipit_themeDark'
};

export const uidKey = 'uid';

export const themeKey = 'theme'; // 'dark' | 'light' | 'mixed'

export const recommendationQuoteKey = 'recommendation_quote';

export const userBooksKey: Record<string, string> = {
  books: 'userBooks_books',
  timestamp: 'userBooks_timestamp'
};