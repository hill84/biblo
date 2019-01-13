import { badWords } from './lists';

// APP
export const appName = 'Biblo';
export const appURL = 'https://delibris-4fa3b.firebaseapp.com';
export const appMainEmail = 'giu.gerbino@gmail.com';

// JUNCTION
export const join = arr => arr && (arr.length > 1) ? [arr.slice(0, -1).join(', '), arr.slice(-1)[0]].join(arr.length < 2 ? '' : ' e ') : arr;
export const joinObj = obj => {
  const arr = Object.keys(obj);
  return obj && (arr.length > 1) ? [arr.slice(0, -1).join(', '), arr.slice(-1)[0]].join(arr.length < 2 ? '' : ' e ') : arr[0]
};
export const joinToLowerCase = arr => arr[0] && join(arr.map(w => w.toLowerCase()));
export const joinComma = arr => (arr.length > 1) ? arr.join(', ') : arr;

// UTILITY
export const isTouchDevice = () => 'ontouchstart' in document.documentElement;
export const copyToClipboard = text => navigator.clipboard.writeText(text).then(() => {
  // console.log('Async: Copying to clipboard was successful!');
}, error => console.warn('Async: Could not copy text: ', error));
const splitWords = text => text.split(/[ ,.;:@!?"<>'«»()/|+-/–=_]+/);
export const getInitials = text => text && text.split(" ").map(w => w.charAt(0)).join('');
export const objToArr = obj => Object.keys(obj);
export const arrToObj = (arr, fn) => {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const item = fn(arr[i], i, arr);
    obj[item.key] = item.value;
  }
  return obj;
};
// example: const obj = arrToObj(arr, function(item) { return { key: item, value: 'author' }});

/* export const arrayToObj = array => { 
  const obj = {}; 
  array.forEach(item => obj[item] = 'author'); 
  return obj;
}; */

export const hasRole = (user, role) => user && user.roles && user.roles[role] === true;

// VALIDATION
export const validateImg = (file, maxSize) => {
  const errors = {};
  const maxBytes = maxSize * 1048576;
  const fileExtension = file.name.split('.').pop();
  const ext = ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'];
  if (ext.indexOf(fileExtension.toLowerCase()) === -1) {
    // console.warn(`Image file extension not supperted: ${fileExtension}`);
    errors.upload = `Tipo file non valido: ${fileExtension}`;
  } else if (file.size > maxBytes) {
    // console.warn('File size too big');
    errors.upload = `File troppo pesante. Max ${maxSize}MB.`;
  }
  return errors;
}

export const checkBadWords = text => splitWords(text).some(word => badWords.some(badWord => word.toLowerCase() === badWord)); // BOOLEAN
export const calcVulgarity = text => splitWords(text).filter(word => badWords.some(badWord => word.toLowerCase() === badWord)).length; // NUMBER

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
export const normalizeCover = str => str && String(str).replace('http:', '').replace('&edge=curl', '');
export const capitalizeFirstLetter = str => str && String(str).charAt(0).toUpperCase() + String(str).slice(1);

// CALCULATION
const calcMinutesToTime = minutes => `${(Math.floor(minutes/60)>0) ? `${Math.floor(minutes/60)} ore` : ''} ${(Math.floor(minutes%60)>0) ? `${Math.floor(minutes%60)} minuti` : ''}`;

export const calcReadingTime = pages => calcMinutesToTime(pages * 1.25);

export const calcAge = birthDate => Math.abs(new Date(Date.now() - new Date(birthDate).getTime()).getUTCFullYear() - 1970);

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

export const screenSize = () => {
  const w = window.innerWidth;
  return w <= 359 ? 'xs' : w <= 768 ? 'sm' : w <= 992 ? 'md' : w <= 1200 ? 'lg' : 'xl';
}

export const booksPerRow = () => {
  const w = window.innerWidth;
  return w <= 359 ? 2 : w <= 768 ? 3 : w <= 992 ? 4 : w <= 1200 ? 6 : 7;
}

export const abbrNum = (number, decPlaces = 0) => {
  decPlaces = Math.pow(10,decPlaces);
  const abbrev = [ "k", "m", "b", "t" ];
  for (let i=3; i>=0; i--) {
    const size = Math.pow(10,(i+1)*3);
    if (size <= number) {
      number = Math.round(number*decPlaces/size)/decPlaces;
      if ((number === 1000) && (i < abbrev.length - 1)) { number = 1; i++; }
      number += abbrev[i];
      break;
    }
  }
  return number;
}

// MAP
export const switchGenres = array => array.map(string => {
  let g;
  switch (string) {
    case "Architecture":                g = "Architettura"; break;
    case "Art":                         
    case "Performing Arts":             g = "Arte"; break;
    case "Bibles":
    case "Religion":                    g = "Religione e spiritualità"; break;
    case "Biography & Autobiography":   g = "Biografie e autobiografie"; break;
    case "Business & Economics":        g = "Economia e finanza"; break;
    case "Comics & Graphic Novels":     g = "Fumetti e Graphic novel"; break;
    case "Cooking":                     g = "Cucina"; break;
    case "Family & Relationships":      g = "Famigliae relazioni"; break;
    case "Fiction":                     g = "Narrativa"; break;
    case "History":                     g = "Storico"; break;
    case "Humor":                       g = "Satira e umorismo"; break;
    case "Informatics":                 g = "Informatica"; break;
    case "Juvenile Fiction":            g = "Per ragazzi"; break;
    case "Literary Criticism":          g = "Saggistica"; break;
    case "Medical":                     g = "Medicina e salute"; break;
    case "Mistery":                     g = "Mistero"; break;
    case "Music":                       g = "Musica"; break;
    case "Philosophy":                  g = "Filosofia"; break;
    case "Politics":                    g = "Politica"; break;
    case "Poetry":                      g = "Poesia"; break;
    case "Science":                     g = "Scienza"; break; 
    case "Science fiction":             g = "Fantascienza"; break; 
    case "Social Science":              g = "Scienze sociali"; break;
    case "Travel":                      g = "Viaggi"; break;
    default:                            g = "Narrativa"; break;
  }
  return g;
});

export const switchLanguages = string => {
  let l;
  switch (string) {
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
  // https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/FirebaseFirestoreException.Code
  const firestoreErrors = [
    { code: 'aborted', msg: "The operation was aborted." },
    { code: 'already-exists', msg: "Some document that we attempted to create already exists." },
    { code: 'cancelled', msg: "The operation was cancelled." },
    { code: 'data-loss', msg: "Unrecoverable data loss or corruption." },
    { code: 'deadline-exceeded', msg: "Deadline expired before operation could complete." },
    { code: 'failed-precondition', msg: "Operation was rejected because of a failed precondition." },
    { code: 'internal', msg: "Internal error." },
    { code: 'invalid-argument', msg: "Client specified an invalid argument." }, 
    { code: 'not-found', msg: "Some requested document was not found." }, 
    { code: 'out-of-range', msg: "Operation was attempted past the valid range." }, 
    { code: 'permission-denied', msg: "The caller does not have permission to execute the specified operation." }, 
    { code: 'resource-exhausted', msg: "Some resource has been exhausted, perhaps a per-user quota." },
    { code: 'unauthenticated', msg: "The request does not have valid authentication credentials for the operation." },
    { code: 'unavailable', msg: "The service is currently unavailable." },
    { code: 'unimplemented', msg: "Operation is not implemented or not supported/enabled." },
    { code: 'unknown', msg: "Unknown error." }
  ];
  const errorMsg = firestoreErrors.filter(e => e.code === err.code);
  return errorMsg.length ? errorMsg[0].msg : 'Errore sconosciuto.';
}