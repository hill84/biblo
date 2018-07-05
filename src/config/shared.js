import { badWords } from './lists';
export const appName = 'Biblo';

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
  //console.log('Async: Copying to clipboard was successful!');
}, error => console.warn('Async: Could not copy text: ', error));
const splitWords = text => text.split(/[ ,.;:@!?"<>'«»()/|+-/–=_]+/);
export const getInitials = text => text && text.split(" ").map(w => w.charAt(0)).join('');
export const objToArr = obj => Object.keys(obj);
export const arrToObj = (arr, fn) => {
  const obj = {};
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    const item = fn(arr[i], i, arr);
    obj[item.key] = item.value;
  }
  return obj;
};
// example: const obj = arrayToObj(arr, function(item) { return { key: item, value: 'author' }});

/* export const arrayToObj = array => { 
  const obj = {}; 
  array.forEach(item => obj[item] = 'author'); 
  return obj;
}; */

// VALIDATION
export const validateImg = (file, maxSize) => {
  const errors = {};
  const maxBytes = maxSize * 1048576;
  const fileExtension = file.name.split('.').pop();
  const ext = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'svg', 'SVG', 'gif', 'GIF', 'webp', 'WEBP'];
  if (ext.indexOf(fileExtension) === -1) {
    //console.warn(`Image file extension not supperted: ${fileExtension}`);
    errors.upload = `Tipo file non valido: ${fileExtension}`;
  } else if (file.size > maxBytes) {
    //console.warn('File size too big');
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
const calcMinutesToTime = minutes => `${(Math.floor(minutes/60)>0) ? `${Math.floor(minutes/60)} ore` : ''} ${(Math.floor(minutes%60)>0) && `${Math.floor(minutes%60)} minuti`}`;

export const calcReadingTime = pages => calcMinutesToTime(pages * .85);

export const calcAge = birthDate => Math.abs(new Date(Date.now() - new Date(birthDate).getTime()).getUTCFullYear() - 1970);

export const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) { return `${interval} anni fa`; }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) { return `${interval} mesi fa`; }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) { return `${interval} giorni fa`; }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) { return `${interval} ore fa`; }
  interval = Math.floor(seconds / 60);
  if (interval > 1) { return `${interval} minuti fa`; }
  return 'pochi secondi fa'; //`${Math.floor(seconds)} secondi fa`;
};

export const booksPerRow = () => {
  const w = window.innerWidth; //document.documentElement.clientWidth;
  let b = 7;
  if (w <= 359) { b = 2; } else 
  if (w <= 768) { b = 3; } else 
  if (w <= 992) { b = 4; } else 
  if (w <= 1200) { b = 6; }
  return b;
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
    case "Humor":                       g = "Umoristico"; break;
    case "Juvenile Fiction":            g = "Per ragazzi"; break;
    case "Literary Criticism":          g = "Saggistica"; break;
    case "Medical":                     g = "Medicina e salute"; break;
    case "Mistery":                     g = "Mistero"; break;
    case "Music":                       g = "Musica"; break;
    case "Philosophy":                  g = "Filosofia"; break;
    case "Poetry":                      g = "Poesia"; break;
    case "Science":                     g = "Scienza"; break; 
    case "Science fiction":             g = "Fantascienza"; break; 
    case "Social Science":              g = "Scienze sociali"; break;
    case "Travel":                      g = "Viaggi"; break;
    default:                            g = ""; break;
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