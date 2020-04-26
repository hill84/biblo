import 'regenerator-runtime/runtime';
import { badWords, firestoreErrorMessages } from './lists';
import logo from '../images/logo.png';

// APP
export const prod = process.env.NODE_ENV === 'production';

export const app = {
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
const lang = typeof window !== "undefined" && (navigator.language || navigator.userLanguage).split('-')[0];

// JUNCTION
export const join = arr => arr?.length > 1 ? [arr?.slice(0, -1).join(', '), arr?.slice(-1)[0]].join(arr?.length < 2 ? '' : ' e ') : String(arr || '');
export const joinObj = obj => {
  const arr = Object.keys({ ...obj });
  return arr.length > 1 ? [arr.slice(0, -1).join(', '), arr.slice(-1)[0]].join(arr.length < 2 ? '' : ' e ') : arr[0]
};
export const joinToLowerCase = arr => arr[0] && join(arr.map(w => w.toLowerCase()));
export const joinComma = arr => arr?.length > 1 ? arr?.join(', ') : arr;

// OPTIONS
export const dateOptions = { day: '2-digit', month: '2-digit', year: '2-digit' };
export const timeOptions = { hour: '2-digit', minute: '2-digit' };

// UTILITY
export const isTouchDevice = () => 'ontouchstart' in document.documentElement;
export const isScrollable = screenSize => isTouchDevice() || screenSize === 'xs' || screenSize === 'sm';
export const copyToClipboard = str => typeof window !== "undefined" && navigator.clipboard.writeText(str).then(() => {
  // console.log('Async: Copying to clipboard was successful!');
}, err => console.warn('Async: Could not copy text: ', err));
const splitWords = str => str?.split(/[ ,.;:@!?"<>'«»()/|+-/–=_]+/);
export const getInitials = str => str?.split(' ').map(w => w.charAt(0)).join('');
// export const objToArr = obj => Object.keys(obj);
export const arrToObj = (arr, fn) => {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const item = fn(arr[i], i, arr);
    obj[item.key] = item.value;
  }
  return obj;
};
// example: const obj = arrToObj(arr, item => { key: item, value: 'author' });
export const truncateString = (str, limit) => str?.length > limit ? `${str?.substr(0, limit)}…` : str;
export const normURL = str => str && encodeURI(str.replace(/ /g, '_'));
export const denormURL = str => str && decodeURI(str.replace(/_/g, ' '));
// export const denormUserRef = str => str.replace(/@+/g, '').replace(/_+/g, ' ');

/* export const arrayToObj = array => { 
  const obj = {}; 
  array.forEach(item => obj[item] = 'author'); 
  return obj;
}; */

export const hasRole = (user, role) => user?.roles?.[role] === true;

export const asyncForEach = async (array, callback) => {
  const results = [];
  for (let i = 0; i < array.length; i++) {
    results.push(callback(array[i], i, array));
  }
  await Promise.all(results);
};

export const setFormatClass = str => {
  switch (str) {
    case 'Audiolibro': return 'audio';
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

// export const extractSpamUrls = str => extractUrls(str)?.filter(s => !s.includes(new URL(app.url).host)); // ARRAY

export const extractUrls = str => str.match(urlRegex); // ARRAY

export const extractRefs = str => str.match(refRegex); // ARRAY

export const extractMentions = str => extractRefs(str)?.filter(ref => ref.split('/')[0] === '@dashboard'); // ARRAY

export const extractMuids = str => [...new Set(extractMentions(str)?.map(item => item.split('/')[1]))]; // ARRAY

// INTERPOLATION
export const enrichText = str => {
  const refs = extractRefs(str);
  const params = match => match.split('/');
  const getLastParam = match => params(match)?.[params(match).length - 1];

  refs?.forEach(match => {
    const _match = match.replace('@', '');
    const output = `<a title="${match}" href="${app.url}/${_match}">${denormURL(getLastParam(match))}</a>`;
    str = str.replace(match, output);
  });

  return str;
};

// VALIDATION
export const validateImg = (file, maxMB = 1) => {
  let error;

  if (file) {
    const maxBytes = maxMB * 1048576;
    if (!file.type.match('image.*')) {
      // console.warn(`File type not valid: ${file.type}`);
      error = `Tipo file non valido: ${file.type}`;
    } else if (file.size > maxBytes) {
      // console.warn('File size too big');
      error = `File troppo pesante. Max ${maxMB}MB.`;
    }
  } else {
    error = `File non trovato`;
  }
  return error;
};

export const checkBadWords = str => splitWords(str).some(word => badWords.some(badWord => word.toLowerCase() === badWord)); // BOOLEAN
export const calcVulgarity = str => splitWords(str).filter(word => badWords.some(badWord => word.toLowerCase() === badWord))?.length; // NUMBER

// NORMALIZATION
export const normalizeString = str => String(str).toLowerCase()
  .replace(/\s+/g,'-')        // Replace spaces with -
  .replace(/--+/g,'-')        // Replace multiple - with single -
  .replace(/[àáâãäå]/g,"a")
  .replace(/[èéêë]/g,"e")
  .replace(/[ìíîï]/g,"i")
  .replace(/[òóôõö]/g,"o")
  .replace(/[ùúûü]/g,"u")
  .replace(/[ýÿ]/g,"y")
  .replace(/æ/g,"ae")
  .replace(/œ/g,"oe")
  .replace(/ç/g,"c")
  .replace(/ñ/g,"n")
  .replace(/^-+/, '')         // Trim - from start of text
  .replace(/-+$/, '');        // Trim - from end of text
export const normalizeCover = str => str?.replace('http:', '').replace('&edge=curl', '');
export const capitalize = str => str && str[0].toUpperCase() + str.slice(1);
export const capitalizeInitials = str => {
  str = str.split(' ');
  for (let i = 0, x = str.length; i < x; i++) {
    str[i] = str[i][0].toUpperCase() + str[i].substr(1);
  }
  return str.join(' ');
};

// CALCULATION
const calcMinutesToTime = minutes => `${(Math.floor(minutes/60)>0) ? `${Math.floor(minutes/60)} ore` : ''} ${(Math.floor(minutes%60)>0) ? `${Math.floor(minutes%60)} minuti` : ''}`;

export const calcReadingTime = pages => calcMinutesToTime(pages * 1.25);

export const calcAge = birthDate => Math.abs(new Date(Date.now() - new Date(birthDate).getTime()).getUTCFullYear() - 1970);

export const round = num => Math.round((num + Number.EPSILON) * 10) / 10;

export const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} anni fa`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} mesi fa`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} giorni fa`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} ore fa`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minuti fa`;
  return 'poco fa'; // `${Math.floor(seconds)} secondi fa`;
};

export const msToTime = s => {
  if (s && s > 59999) {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;
    const hours = hrs ? `${hrs} or${hrs === 1 ? 'a' : 'e'}` : '';
    const minutes = mins ? `${mins} minut${mins === 1 ? 'o' : 'i'}` : '';
    return `${hours}${hours && minutes ? ' e ' : ''}${minutes}`;
  }
  return 'non disponibile';
};

const time = hours => hours * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
export const diffDates = (hours, secondDate, firstDate = Date.now()) => Math.round(Math.abs((firstDate - secondDate) / time(hours)));

export const isToday = num => new Date(num).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);

export const screenSize = () => {
  const w = window.innerWidth;
  return w <= 359 ? 'xs' : w <= 768 ? 'sm' : w <= 992 ? 'md' : w <= 1200 ? 'lg' : 'xl';
};

export const booksPerRow = () => {
  const w = window.innerWidth;
  return w <= 359 ? 2 : w <= 768 ? 3 : w <= 992 ? 4 : w <= 1200 ? 6 : 7;
};

export const abbrNum = (num, decPlaces = 0) => {
  decPlaces = 10 ** decPlaces;
  const abbrev = [ "k", "m", "b", "t" ];
  for (let i = 3; i >= 0; i--) {
    const size = 10 ** ((i + 1) * 3);
    if (size <= num) {
      num = Math.round(num * decPlaces / size) / decPlaces;
      if ((num === 1000) && (i < abbrev.length - 1)) { 
        num = 1; i++; 
      }
      num += abbrev[i];
      break;
    }
  }
  return num;
};

// MAP
export const switchGenres = array => array.map(str => {
  switch (str) {
    case "Architecture, Byzantine":
    case "Architecture, Classical":
    case "Architecture, Gothic":
    case "Architecture, Modern":
    case "Architecture, Roman":
    case "Architecture, Romanesque":
    case "Architecture":                return "Architettura";
    case "Aesthetics":
    case "Art":
    case "Art, Abstract":
    case "Art, Ancient":
    case "Art, European":
    case "Art, Greek":
    case "Art, Italian":
    case "Art, Modern":
    case "Art, Roman":
    case "Cubism":
    case "Design":
    case "Photography of art":
    case "Women in art":                return "Arte";
    case "Dance":
    case "Language Arts & Disciplines":
    case "Performing Arts":
    case "Drama":                       return "Teatro";
    case "Bibles":
    case "Body, Mind & Spirit":
    case "Religion":                    return "Religione e spiritualità";
    case "Biography & Autobiography":   return "Biografie e autobiografie";
    case "Business & Economics":        return "Economia e finanza";
    case "Comics & Graphic Novels":     return "Fumetti e Graphic novel";
    case "Cookery":
    case "Cooking":                     return "Cucina";
    case "Family & Relationships":      return "Famiglia e relazioni";
    // case "Fiction":                     return "Narrativa";
    case "History, Modern":
    case "History":                     return "Storico";
    case "Humor":                       return "Satira e umorismo";
    case "Computers":
    case "Informatics":                 return "Informatica";
    case "Juvenile Nonfiction":
    case "Juvenile Fiction":            return "Per ragazzi";
    case "Essay":
    case "Reference":
    case "Literary Criticism":          return "Saggistica";
    case "Health & Fitness":
    case "Self-Help":
    case "Medical":                     return "Medicina e salute";
    case "Mistery":                     return "Mistero";
    case "Music":                       return "Musica";
    case "Philosophy":                  return "Filosofia";
    case "Politics":                    return "Politica";
    case "Poetry":                      return "Poesia";
    case "Algebra":
    case "Arithmetic":
    case "Astronomy":
    case "Calculus":
    case "Mathematics":
    case "Physics":
    case "Science":                     return "Scienza"; 
    case "Science fiction":             return "Fantascienza";
    case "Sports & Recreation":
    case "Games":
    case "Games & Activities":          return "Sport";
    case "Social Science":              return "Scienze sociali";
    case "True Crime":                  return "Thriller"
    case "Travel":                      return "Viaggi";
    default:                            return "Narrativa";
  }
});

export const switchLanguages = str => {
  let l;
  switch (str) {
    case "ar": l = "Arabo"; break;
    case "zh": l = "Cinese"; break;
    case "ko": l = "Coreano"; break;
    case "fr": l = "Francese"; break;
    case "ja": l = "Giapponese"; break;
    case "el": l = "Greco"; break;
    case "en": l = "Inglese"; break;
    case "it": l = "Italiano"; break;
    case "pt": l = "Portoghese"; break;
    case "ru": l = "Russo"; break;
    case "es": l = "Spagnolo"; break;
    case "de": l = "Tedesco"; break; 
    default: l = ""; break;
  }
  return l;
};

export const handleFirestoreError = err => {
  if (process.env.NODE_ENV !== 'production') console.warn(err);
  return firestoreErrorMessages[err.code] && (lang === 'it' || lang === 'en') ? firestoreErrorMessages[err.code][lang] : err.message;
};

export const slowImport = (value, ms = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
};

export const fakeImportComponent = (value, ms = 1000, bool) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => bool ? resolve({ default: value }) : reject(Error), ms);
  });
};

export const createCookie = (name, value, days) => {
  let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = `; expires=${date.toGMTString()}`;
	}
	document.cookie = `${name}=${value}${expires}; path=/`;
};

export const readCookie = name => {
	const nameEQ = `${name}=`;
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
};

export const eraseCookie = name => createCookie(name, "", -1);