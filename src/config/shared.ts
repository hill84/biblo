import { FirestoreError } from '@firebase/firestore-types';
import { Duration, formatDistanceStrict, formatDuration, intervalToDuration } from 'date-fns';
import 'regenerator-runtime/runtime';
import i18n, { getLocale } from '../i18n';
import logo from '../images/logo.png';
import { AppModel, BookModel, BooksPerRowType, FormatType, RolesType, ScreenSizeType, UserModel } from '../types';
import { badWords, firestoreErrorMessages } from './lists';

// APP
export const prod: boolean = process.env.NODE_ENV === 'production';

export const app: AppModel = {
  name: 'Biblo.space',
  url: prod ? 'https://biblo.space' : 'http://localhost:3000',
  logo,
  fb: { name: 'Biblo.space', url: 'https://www.facebook.com/biblo.space' },
  tw: { name: 'Biblo.space', url: 'https://twitter.com/BibloSpace' },
  help: {
    group: { url: 'group/dA0AFJR8uU4nBYiCIf5U' }
  },
  email: 'info@biblo.space',
  privacyEmail: 'privacy@biblo.space',
  desc: 'Biblo è il social network dedicato a chi ama i libri e la lettura. Registrati, crea la tua libreria, scopri nuovi libri, conosci altri lettori come te.'
};

// NAVIGATOR
const lang: string = typeof window !== 'undefined' ? (navigator.language).split('-')[0] : i18n.language;

// JUNCTION
export const join = (arr: string[], separator: string): string => arr?.length > 1 ? [arr?.slice(0, -1).join(', '), arr?.slice(-1)[0]].join(arr?.length < 2 ? '' : ` ${separator} `) : String(arr || '');
export const joinObj = (obj: Record<string, unknown>, separator: string): string => {
  const arr: string[] = Object.keys({ ...obj });
  return arr.length > 1 ? [arr.slice(0, -1).join(', '), arr.slice(-1)[0]].join(arr.length < 2 ? '' : ` ${separator} `) : arr[0] || '';
};
export const joinToLowerCase = (arr: string[], separator: string): string => join(arr, separator).toLowerCase();

// OPTIONS
export const dateOptions: Record<string, string> = { day: '2-digit', month: '2-digit', year: '2-digit' };
export const timeOptions: Record<string, string> = { hour: '2-digit', minute: '2-digit' };

// UTILITY
export const isTouchDevice = () => 'ontouchstart' in document.documentElement;
export const isScrollable = (screenSize: ScreenSizeType): boolean => isTouchDevice() || screenSize === 'xs' || screenSize === 'sm';
export const copyToClipboard = (str: string): void => {
  if (typeof window !== 'undefined') {
    navigator.clipboard.writeText(str).then((): void => {
      // console.log('Async: Copying to clipboard was successful!');
    }, (err: unknown): void => {
      console.warn('Async: Could not copy text: ', err);
    });
  }
};
export const splitWords = (str: string): string[] => str?.split(/[ ,.;:@!?"<>'«»()/|+-/–=_]+/);
export const getInitials = (str: string): string => str?.split(' ').map((w: string): string => w.charAt(0)).join('');
// export const objToArr = obj => Object.keys(obj);
export const arrToObj = <G>(arr: Array<unknown>, fn: Function): Record<string, G> => {
  const obj: Record<string, G> = {};
  for (let i = 0; i < arr.length; i++) {
    if (['string', 'number'].includes(typeof arr[i])) {
      const item = fn(arr[i], i, arr);
      obj[item.key] = item.value;
    }
  }
  return obj;
};

export const truncateString = (str = '', limit?: number): string => typeof limit === 'number' && str?.length > limit ? `${str?.substring(0, limit)}…` : str;
export const translateURL = (str = ''): string => str ? encodeURI(str.replace(/-/g, '_').toUpperCase()) : '';
export const normURL = (str = ''): string => str ? encodeURI(str.replace(/ /g, '_')) : '';
export const denormURL = (str = ''): string => str ? decodeURI(str.replace(/_/g, ' ')) : '';
// export const denormUserRef = (str: string): string => str.replace(/@+/g, '').replace(/_+/g, ' ');

export const hasRole = (user: UserModel, role: RolesType): boolean => user.roles?.[role] === true;

export const asyncForEach = async <G, >(array: Array<G>, callback: Function): Promise<void> => {
  const results = [];
  for (let i = 0; i < array.length; i++) {
    results.push(callback(array[i], i, array));
  }
  await Promise.all(results);
};

export const setFormatClass = (str = ''): FormatType => {
  switch (str) {
    case 'Audio': return 'audio';
    case 'Rivista': return 'magazine';
    case 'Ebook': return 'ebook';
    default: return 'book';
  }
};

// REGEX
export const numRegex = /-?(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?/;

export const urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9$\-_.+!*'(),;?&=]|(?:%[a-fA-F0-9]{2})){1,64}(?::(?:[a-zA-Z0-9$\-_.+!*'(),;?&=]|(?:%[a-fA-F0-9]{2})){1,25})?@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?::\d{1,5})?)(\/(?:(?:[a-zA-Z0-9;/?:@&=#~\-.+!*'(),_])|(?:%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;

export const emailRegex = /[a-zA-Z0-9\\+\\.\\_\\%\\-]{1,256}\\@[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}(\\.[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25})+/gi;

export const refRegex = /(?<![\w\d+])@([\w\d/+]*)(?![s+])/gi;

// export const extractSpamUrls = (str: string): string[] | undefined => extractUrls(str)?.filter(s => !s.includes(new URL(app.url).host));

export const extractUrls = (str = ''): RegExpMatchArray | null => str.match(urlRegex);

export const extractRefs = (str = ''): RegExpMatchArray | null => str.match(refRegex);

export const extractMentions = (str = ''): string[] | undefined => extractRefs(str)?.filter((ref: string): boolean => ref.split('/')[0] === '@dashboard');

export const extractMuids = (str = ''): string[] => [...new Set(extractMentions(str)?.map((item: string): string => item.split('/')[1]))];

// INTERPOLATION
export const enrichText = (str = ''): string => {
  const refs: RegExpMatchArray | null = extractRefs(str);
  const params = (match: string): string[] => match.split('/');
  const getLastParam = (match: string): string => params(match)?.[params(match).length - 1];

  refs?.forEach((match = ''): void => {
    const _match: string = match.replace('@', '');
    const output = `<a title="${match}" href="${app.url}/${_match}">${denormURL(getLastParam(match))}</a>`;
    str = str.replace(match, output);
  });

  return str;
};

export const noCookie = (str = ''): string | undefined => {
  if (!str) return str;
  const { protocol, pathname } = new URL(str);
  let { hostname } = new URL(str);

  if (['youtu.be', 'youtube.com'].some((yb: string): boolean => yb === hostname)) {
    hostname = 'www.youtube-nocookie.com/embed';
  }

  return `${protocol}//${hostname}${pathname}`;
};

// VALIDATION
export const validateImg = (file?: File, maxMB = 1): string => {
  let error = '';

  if (file) {
    const maxBytes: number = maxMB * 1048576;
    if (!file.type.match('image.*')) {
      // console.warn(`File type not valid: ${file.type}`);
      error = `Tipo non valido: ${file.type}`;
    } else if (file.size > maxBytes) {
      // console.warn('File size too big');
      error = `Max ${maxMB}MB`;
    }
  } else {
    error = 'No file';
  }
  return error;
};

export const checkBadWords = (str = ''): boolean => splitWords(str).some((word: string): boolean => badWords.some((badWord: string): boolean => word.toLowerCase() === badWord));
export const calcVulgarity = (str = ''): number => splitWords(str).filter((word: string): boolean => badWords.some((badWord: string): boolean => word.toLowerCase() === badWord))?.length;

// NORMALIZATION
export const normalizeString = (str = ''): string => String(str).toLowerCase()
  .replace(/\s+/g,'-')        // Replace spaces with -
  .replace(/--+/g,'-')        // Replace multiple - with single -
  .replace(/[àáâãäå]/g,'a')
  .replace(/[èéêë]/g,'e')
  .replace(/[ìíîï]/g,'i')
  .replace(/[òóôõö]/g,'o')
  .replace(/[ùúûü]/g,'u')
  .replace(/[ýÿ]/g,'y')
  .replace(/æ/g,'ae')
  .replace(/œ/g,'oe')
  .replace(/ç/g,'c')
  .replace(/ñ/g,'n')
  .replace(/^-+/, '')         // Trim - from start of text
  .replace(/-+$/, '');        // Trim - from end of text

export const normalizeAuthor = (author = ''): string => {
  const splittedAuthor = author.trim().split('.').join('').toLowerCase();
  if (['aavv', 'aa vv'].includes(splittedAuthor)) return 'AAVV';
  return capitalizeInitials(splittedAuthor);
};

export const normalizeAuthors = (authors: string[] = []): BookModel['authors'] => {
  if (!authors.length) return {};
  const normalizedAuthors: string[] = authors.filter(Boolean).map((author: string): string => normalizeAuthor(author));
  return arrToObj(normalizedAuthors, (item: boolean): BookModel['authors'] => ({ key: item, value: true }));
};

export const normalizeFormat = (printType = '', isEbook = false): 'Ebook' | 'Libro' | 'Rivista' => {
  switch (printType) {
    case 'MAGAZINE': return 'Rivista';
    default: return isEbook ? 'Ebook' : 'Libro';
  }
};

export const normalizeCover = (str = ''): string => str.replace('http:', '').replace('&edge=curl', '');
export const capitalize = (str = ''): string => str ? str[0].toUpperCase() + str.slice(1) : '';
export const capitalizeInitials = (str = ''): string => {
  const arr: string[] = str.split(' ');
  for (let i = 0, x: number = arr.length; i < x; i++) {
    if (!arr[i]) return '';
    arr[i] = arr[i][0]?.toUpperCase() + arr[i].substring(1);
  }
  return arr.join(' ');
};

// CALCULATION
export const msToDuration = (ms: number): Duration => {
  const start = new Date();
  const end = new Date(start.getTime() + ms);
  return intervalToDuration({ start, end });
};

export const calcReadingTime = (pages: number): string => {
  // TODO: get locale
  const ms: number = pages * 1.25 * 60 * 1000;
  const duration: Duration = msToDuration(ms);
  const locale: Locale | undefined = getLocale();
  const options = { format: ['hours', 'minutes'], locale };
  return formatDuration(duration, options);
};

export const calcDurationTime = (ms: number): string => {
  const duration: Duration = msToDuration(ms);
  const locale: Locale | undefined = getLocale();
  const options = { format: ['hours', 'minutes'], locale };
  return formatDuration(duration, options);
};

export const calcAge = (birth_date: string, now = Date.now()): number => {
  const num: number = new Date(birth_date).getTime();
  if (Number.isNaN(num)) return 0;
  return Math.abs(new Date(now - num).getUTCFullYear() - 1970);
};

export const timeSince = (num?: number, now = Date.now()): string => {
  if (typeof num !== 'number' || Number.isNaN(num)) return '';
  const locale: Locale | undefined = getLocale();
  return formatDistanceStrict(num, now, { addSuffix: true, locale });
};

export const round = (num: number): number => Math.round((num + Number.EPSILON) * 10) / 10;

const time = (hours: number): number => hours * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
export const diffDates = (hours: number, secondDate: number, firstDate = Date.now()): number => Math.round(Math.abs((firstDate - secondDate) / time(hours)));

export const screenSize = (): ScreenSizeType => {
  const w: number = window.innerWidth;
  return w <= 359 ? 'xs' : w <= 768 ? 'sm' : w <= 992 ? 'md' : w <= 1200 ? 'lg' : 'xl';
};

export const booksPerRow = (): BooksPerRowType => {
  const w: number = window.innerWidth;
  return w <= 359 ? 2 : w <= 768 ? 3 : w <= 992 ? 4 : w <= 1200 ? 6 : 7;
};

export const abbrNum = (num: number, decPlaces = 0): string => {
  decPlaces = 10 ** decPlaces; // CHECK: is this working?
  const abbrev: string[] = ['k', 'm', 'b', 't'];
  let res = String(num);
  for (let i = 3; i >= 0; i--) {
    const size = 10 ** ((i + 1) * 3);
    if (size <= num) {
      num = Math.round(num * decPlaces / size) / decPlaces;
      if ((num === 1000) && (i < abbrev.length - 1)) { 
        num = 1; i++; 
      }
      res = num + abbrev[i];
      break;
    }
  }
  return res;
};

// MAPS
export const switchGenres = (array: string[]): string[] => array.map((str: string): string => {
  switch (str) {
    case 'Architecture, Byzantine':
    case 'Architecture, Classical':
    case 'Architecture, Gothic':
    case 'Architecture, Modern':
    case 'Architecture, Roman':
    case 'Architecture, Romanesque':
    case 'Architecture':                return 'Architettura';
    case 'Aesthetics':
    case 'Art':
    case 'Art, Abstract':
    case 'Art, Ancient':
    case 'Art, European':
    case 'Art, Greek':
    case 'Art, Italian':
    case 'Art, Modern':
    case 'Art, Roman':
    case 'Cubism':
    case 'Design':
    case 'Photography of art':
    case 'Women in art':                return 'Arte';
    case 'Dance':
    case 'Language Arts & Disciplines':
    case 'Performing Arts':
    case 'Drama':                       return 'Teatro';
    case 'Bibles':
    case 'Body, Mind & Spirit':
    case 'Religion':                    return 'Religione e spiritualità';
    case 'Biography & Autobiography':   return 'Biografie e autobiografie';
    case 'Business & Economics':        return 'Economia e finanza';
    case 'Comics & Graphic Novels':     return 'Fumetti e Graphic novel';
    case 'Cookery':
    case 'Cooking':                     return 'Cucina';
    case 'Family & Relationships':      return 'Famiglia e relazioni';
    // case 'Fiction':                     return 'Narrativa';
    case 'History, Modern':
    case 'History':                     return 'Storico';
    case 'Humor':                       return 'Satira e umorismo';
    case 'Computers':
    case 'Informatics':                 return 'Informatica';
    case 'Juvenile Nonfiction':
    case 'Juvenile Fiction':            return 'Per ragazzi';
    case 'Essay':
    case 'Reference':
    case 'Literary Criticism':          return 'Saggistica';
    case 'Health & Fitness':
    case 'Self-Help':
    case 'Medical':                     return 'Medicina e salute';
    case 'Mistery':                     return 'Mistero';
    case 'Music':                       return 'Musica';
    case 'Philosophy':                  return 'Filosofia';
    case 'Politics':                    return 'Politica';
    case 'Poetry':                      return 'Poesia';
    case 'Algebra':
    case 'Arithmetic':
    case 'Astronomy':
    case 'Calculus':
    case 'Mathematics':
    case 'Physics':
    case 'Science':                     return 'Scienza'; 
    case 'Science fiction':             return 'Fantascienza';
    case 'Sports & Recreation':
    case 'Games':
    case 'Games & Activities':          return 'Sport';
    case 'Social Science':              return 'Scienze sociali';
    case 'True Crime':                  return 'Thriller';
    case 'Travel':                      return 'Viaggi';
    default:                            return 'Narrativa';
  }
});

export const switchLanguages = (str: string): string => {
  let l: string;
  switch (str) {
    case 'ar': l = 'Arabo'; break;
    case 'zh': l = 'Cinese'; break;
    case 'ko': l = 'Coreano'; break;
    case 'fr': l = 'Francese'; break;
    case 'ja': l = 'Giapponese'; break;
    case 'el': l = 'Greco'; break;
    case 'en': l = 'Inglese'; break;
    case 'it': l = 'Italiano'; break;
    case 'pt': l = 'Portoghese'; break;
    case 'ru': l = 'Russo'; break;
    case 'es': l = 'Spagnolo'; break;
    case 'de': l = 'Tedesco'; break; 
    default: l = ''; break;
  }
  return l;
};

export const handleFirestoreError = (err: FirestoreError): string => {
  if (process.env.NODE_ENV !== 'production') console.warn(err);
  return firestoreErrorMessages[err.code] && (lang === 'it' || lang === 'en') ? firestoreErrorMessages[err.code][lang] : err.message;
};

// COOKIES
export const createCookie = (name: string, value: string, days: number): void => {
  let expires = '';
  if (days) {
    const date: Date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = `${name}=${value}${expires}; path=/`;
};

export const readCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca: string[] = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c: string = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string): void => createCookie(name, '', -1);