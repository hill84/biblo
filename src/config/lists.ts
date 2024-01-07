import type { RolesType } from '../types';

export type GenreNameType = 'Architettura' | 'Arte' | 'Avventura' | 'Biografie e autobiografie' | 'Cucina' | 'Economia e finanza' | 'Erotico' | 'Famiglia e relazioni' | 'Fantascienza' | 'Fantasy' | 'Filosofia' | 'Fumetti e Graphic novel' | 'Giallo' | 'Horror' | 'Informatica' | 'Per ragazzi' | 'Medicina e salute' | 'Mistero' | 'Musica' | 'Narrativa' | 'Poesia' | 'Politica' | 'Psicologia' | 'Religione e spiritualità' | 'Rosa' | 'Saggistica' | 'Scienza' | 'Sport' | 'Scienze sociali' | 'Storico' | 'Teatro' | 'Thriller' | 'Satira e umorismo' | 'Viaggi';

export interface GenreModel {
  id: string;
  color: string;
  name: GenreNameType;
  canonical: string;
}

export interface ListModel {
  id: string;
  label?: string; // TODO: SHOULD BE REQUIRED
  name: string;
  native?: string;
}

export type MonthModel = Record<'id' | 'eng' | 'ita', string>;

export const roles: RolesType[] = ['author', 'admin', 'editor', 'premium'];
export const dashboardTabs: string[] = ['shelf', 'wishlist', 'activity', 'statistics', 'contacts'];
export const profileKeys: string[] = ['displayName', 'birth_date', 'continent', 'city', 'languages', 'photoURL', 'sex'];
export const noteTypes: string[] = ['comment', 'follow', 'like', 'mention', 'recommendation', 'welcome', 'test'];
// export const userBookTypes: string[] = ['Tutti', 'Non iniziati', 'In lettura', 'Finiti', 'Abbandonati', 'Da consultazione'];
// export const readingStates: string[] = ['Non iniziato', 'In lettura', 'Finito', 'Abbandonato', 'Da consultazione'];
export const readingStates: ListModel[] = [
  { id: '1', name: 'Non iniziati', label: 'BOOK_TYPE_UNREAD' }, 
  { id: '2', name: 'In lettura', label: 'BOOK_TYPE_READING' }, 
  { id: '3', name: 'Finiti', label: 'BOOK_TYPE_READ' }, 
  { id: '4', name: 'Abbandonati', label: 'BOOK_TYPE_ABANDONED' }, 
  { id: '5', name: 'Da consultazione', label: 'BOOK_TYPE_REFERENCE' },
];
export const userBookTypes: ListModel[] = [
  { id: '0', name: 'Tutti', label: 'FILTER_BOOK_TYPE_ALL' }, 
  { id: '1', name: 'Non iniziati', label: 'FILTER_BOOK_TYPE_UNREAD' }, 
  { id: '2', name: 'In lettura', label: 'FILTER_BOOK_TYPE_READING' }, 
  { id: '3', name: 'Finiti', label: 'FILTER_BOOK_TYPE_READ' }, 
  { id: '4', name: 'Abbandonati', label: 'FILTER_BOOK_TYPE_ABANDONED' }, 
  { id: '5', name: 'Da consultazione', label: 'FILTER_BOOK_TYPE_REFERENCE' },
];
export const awards: ListModel[] = [
  { id: 'and', name: 'Premio Andersen', label: 'AWARD_ANDERSON' },
  { id: 'ban', name: 'Premio Bancarella', label: 'AWARD_BANCARELLA' },
  { id: 'cal', name: 'Premio Italo Calvino', label: 'AWARD_ITALO_CALVINO' },
  { id: 'cam', name: 'Premio Campiello', label: 'AWARD_CAMPIELLO' },
  { id: 'nob', name: 'Premio Nobel per la letteratura', label: 'AWARD_NOBEL' },
  { id: 'pul', name: 'Premio Pulitzer', label: 'AWARD_PULITZER' },
  { id: 'str', name: 'Premio Strega', label: 'AWARD_STREGA' },
];

export const firestoreErrorMessages: Record<string, Record<'en' | 'it', string>> = {
  // https://firebase.google.com/docs/reference/android/com/google/firebase/firestore/FirebaseFirestoreException.Code
  'aborted': {
    en: 'The operation was aborted.',
    it: 'L\'operazione è stata abortita.'
  }, 
  'already-exists': {
    en: 'Some document that we attempted to create already exists.',
    it: 'Alcuni documenti che abbiamo provato a creare esistono già'
  },
  'cancelled': {
    en: 'The operation was cancelled.',
    it: 'L\'operazione è stata cancellata.'
  },
  'data-loss': {
    en: 'Unrecoverable data loss or corruption.',
    it: 'Perdita di dati.'
  },
  'deadline-exceeded': { 
    en: 'Deadline expired before operation could complete.',
    it: 'Deadline scaduta.'
  },
  'failed-precondition': { 
    en: 'Operation was rejected because of a failed precondition.',
    it: 'Operazione rifiutata a causa di una precondizione fallita.' 
  },
  'internal': { 
    en: 'Internal error.',
    it: 'Errore interno.' 
  },
  'invalid-argument': { 
    en: 'Client specified an invalid argument.',
    it: 'Argomento non valido.' 
  }, 
  'not-found': { 
    en: 'Some requested document was not found.',
    it: 'Documento non trovato.' 
  }, 
  'out-of-range': { 
    en: 'Operation was attempted past the valid range.',
    it: 'Operazione fuori range massimo.' 
  }, 
  'permission-denied': { 
    en: 'The caller does not have permission to execute the specified operation.',
    it: 'Utente non autorizzato.' 
  }, 
  'resource-exhausted': { 
    en: 'Some resource has been exhausted, perhaps a per-user quota.',
    it: 'Quota esaurita.'
  },
  'unauthenticated': { 
    en: 'The request does not have valid authentication credentials for the operation.',
    it: 'Utente non autorizzato.' 
  },
  'unavailable': { 
    en: 'The service is currently unavailable.',
    it: 'Servizio temporaneamente non disponibile.' 
  },
  'unimplemented': { 
    en: 'Operation is not implemented or not supported/enabled.',
    it: 'Operazione non implementata o supportata.' 
  },
  'unknown': { 
    en: 'Unknown error.',
    it: 'Errore sconosciuto.' 
  },
  // AUTH
  'auth/account-exists-with-different-credential': {
    en: 'An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.',
    it: 'L\'email con cui hai provato ad accedere risulta già associata a un altro account. Fai login con un altro provider.'
  },
  'auth/email-already-in-use': {
    en: 'The email address is already in use by another account.',
    it: 'Indirizzo email già usato da un altro account.'
  },
  'auth/internal-error': {
    en: 'Internal error.',
    it: 'Errore interno.'
  },
  'auth/invalid-credential': {
    en: 'Error getting verification code',
    it: 'Errore nell\'ottenimento del codice di verifica'
  },
  'auth/network-request-failed': {
    en: 'Network error.',
    it: 'Nessuna connessione internet.'
  },
  'auth/popup-closed-by-user': {
    en: 'The popup has been closed by the user before finalizing the operation.',
    it: 'Il popup è stato chiuso dall\'utente prima di finalizzare l\'operazione.'
  },
  'auth/too-many-requests': {
    en: 'We have blocked all requests from this device due to unusual activity. Try again later.',
    it: 'Abbiamo rilevato attività sospette provenienti da questo dispositivo. Riprova più tardi.'
  },
  'auth/user-disabled': {
    en: 'The user account has been disabled by an administrator.',
    it: 'L\'account utente è stato disabilitato da un amministratore.'
  },
  'auth/user-not-found': {
    en: 'There is no user record corresponding to this identifier. The user may have been deleted.',
    it: 'Utente non trovato. Potrebbe essere stato cancellato.'
  },
  'auth/wrong-password': {
    en: 'The password is invalid or the user does not have a password.',
    it: 'La password è sbagliata o l\'utente non ha una password. Forse ti sei registrato con un social?'
  },
};

export const ratingLabels: Record<number | string, string> = { 
  0: 'Nessun voto', 
  '0.5': 'Orrendo', 
  1: 'Pessimo', 
  '1.5': 'Scarso',
  2: 'Insufficiente', 
  '2.5': 'Mediocre',
  3: 'Sufficiente', 
  '3.5': 'Discreto', 
  4: 'Buono', 
  '4.5': 'Molto Buono',
  5: 'Ottimo',
};

export const formats: ListModel[] = [
  { id: '0', name: 'Libro', label: 'BOOK' },
  { id: '1', name: 'Rivista', label: 'MAGAZINE' },
  { id: '3', name: 'Ebook', label: 'EBOOK' },
  { id: '4', name: 'Audio', label: 'AUDIOBOOK' },
];

export const genres: GenreModel[] = [
  { id: 'ac', color: '#62A7B5', name: 'Architettura', canonical: 'architecture' },
  { id: 'ar', color: '#539E91', name: 'Arte', canonical: 'fine-art' },
  { id: 'av', color: '#74C493', name: 'Avventura', canonical: 'adventure' },
  { id: 'bi', color: '#C5E1A5', name: 'Biografie e autobiografie', canonical: 'biography-memoir' },
  { id: 'cu', color: '#E6EE9C', name: 'Cucina', canonical: 'cooking-cookbooks' },
  { id: 'ef', color: '#52B586', name: 'Economia e finanza', canonical: 'economics' }, 
  { id: 'er', color: '#E279A3', name: 'Erotico', canonical: 'erotica' },
  { id: 'fa', color: '#F19670', name: 'Famiglia e relazioni', canonical: 'family-relationships' },
  { id: 'sf', color: '#7986CB', name: 'Fantascienza', canonical: 'science-fiction' },
  { id: 'fy', color: '#BB7ED6', name: 'Fantasy', canonical: 'fantasy' },
  { id: 'fi', color: '#DE7070', name: 'Filosofia', canonical: 'philosophy' },
  { id: 'fu', color: '#E09A6A', name: 'Fumetti e Graphic novel', canonical: 'graphic-novels' },
  { id: 'gl', color: '#FFCA28', name: 'Giallo', canonical: 'mistery' },
  { id: 'ho', color: '#D45858', name: 'Horror', canonical: 'horror' },
  { id: 'in', color: '#C3C7CA', name: 'Informatica', canonical: 'computer-science' },
  { id: 'ju', color: '#4DB6AC', name: 'Per ragazzi', canonical: 'childrens-fiction' },
  { id: 'ms', color: '#5C8E8B', name: 'Medicina e salute', canonical: 'medical-sciences' },
  { id: 'mi', color: '#546E7A', name: 'Mistero', canonical: 'mystery' },
  { id: 'mu', color: '#7C9FB0', name: 'Musica', canonical: 'music' },
  { id: 'na', color: '#5698C4', name: 'Narrativa', canonical: 'fiction-literature' },
  { id: 'po', color: '#74B8BF', name: 'Poesia', canonical: 'poetry' },
  { id: 'pl', color: '#9ABF88', name: 'Politica', canonical: 'political-science' },
  { id: 'ps', color: '#7DCEAB', name: 'Psicologia', canonical: 'psychology' },
  { id: 're', color: '#FFE082', name: 'Religione e spiritualità', canonical: 'religion-spirituality' },
  { id: 'ro', color: '#EF9A9A', name: 'Rosa', canonical: 'romance' },
  { id: 'sa', color: '#93B0D0', name: 'Saggistica', canonical: 'essays' },
  { id: 'sc', color: '#51B9DE', name: 'Scienza', canonical: 'science' },
  { id: 'sp', color: '#E4002B', name: 'Sport', canonical: 'sports' },
  { id: 'ss', color: '#D7A96D', name: 'Scienze sociali', canonical: 'social-sciences' },
  { id: 'st', color: '#B98054', name: 'Storico', canonical: 'history' },
  { id: 'te', color: '#8D6E63', name: 'Teatro', canonical: 'drama' },
  { id: 'th', color: '#BBA466', name: 'Thriller', canonical: 'thriller' },
  { id: 'um', color: '#9EC16C', name: 'Satira e umorismo', canonical: 'satire-humor' },
  { id: 'vi', color: '#32CCC3', name: 'Viaggi', canonical: 'travel' }
];

export const languages: ListModel[] = [
  // id: ISO 639-1
  { id: 'ar', name: 'Arabo', native: 'العربية' },
  { id: 'bg', name: 'Bulgaro', native: 'Български' },
  { id: 'cs', name: 'Ceco', native: 'Čeština' },
  { id: 'da', name: 'Danese', native: 'Dansk' },
  { id: 'de', name: 'Tedesco', native: 'Deutsch' },
  { id: 'el', name: 'Greco', native: 'Ελληνικά' },
  { id: 'en', name: 'Inglese', native: 'English' },
  { id: 'es', name: 'Spagnolo', native: 'Español' },
  { id: 'et', name: 'Estone', native: 'Eesti keel' },
  { id: 'fi', name: 'Finlandese', native: 'Suomi' },
  { id: 'fr', name: 'Francese', native: 'Français' },
  { id: 'ga', name: 'Irlandese', native: 'Gaeilge' },
  { id: 'hr', name: 'Croato', native: 'Hrvatski' },
  { id: 'hu', name: 'Ungherese', native: 'Magyar' },
  { id: 'it', name: 'Italiano', native: 'Italiano' },
  { id: 'ja', name: 'Giapponese', native: '日本語' },
  { id: 'ko', name: 'Coreano', native: '한국어' },
  { id: 'lt', name: 'Lituano', native: 'Lietuvių kalba' },
  { id: 'lv', name: 'Lettone', native: 'Latviešu valoda' },
  { id: 'mt', name: 'Maltese', native: 'Malti' },
  { id: 'nl', name: 'Neerlandese', native: 'Nederlands' },
  { id: 'pl', name: 'Polacco', native: 'Polski' },
  { id: 'pt', name: 'Portoghese', native: 'Português' },
  { id: 'ro', name: 'Rumeno', native: 'Română' },
  { id: 'ru', name: 'Russo', native: 'Русский язык' },
  { id: 'sk', name: 'Slovacco', native: 'Slovenčina' },
  { id: 'sl', name: 'Sloveno', native: 'Slovenščina' },
  { id: 'sv', name: 'Svedese', native: 'Svenska' },
  { id: 'uk', name: 'Ucraino', native: 'Yкpaïнcькa мо́ва' },
  { id: 'zh', name: 'Cinese', native: '中文' },
];

export const months: MonthModel[] = [
  { id: 'jan', eng: 'January', ita: 'Gennaio' }, 
  { id: 'feb', eng: 'February', ita: 'Febbraio' }, 
  { id: 'mar', eng: 'March', ita: 'Marzo' }, 
  { id: 'apr', eng: 'April', ita: 'Aprile' }, 
  { id: 'may', eng: 'May', ita: 'Maggio' }, 
  { id: 'jun', eng: 'June', ita: 'Giugno' }, 
  { id: 'jul', eng: 'July', ita: 'Luglio' }, 
  { id: 'aug', eng: 'August', ita: 'Agosto' }, 
  { id: 'sep', eng: 'September', ita: 'Settembre' }, 
  { id: 'oct', eng: 'October', ita: 'Ottobre' }, 
  { id: 'nov', eng: 'November', ita: 'Novembre' }, 
  { id: 'dec', eng: 'December', ita: 'Dicembre'},
];

export const continents: ListModel[] = [
  { id: 'AF', name: 'Africa', label: 'AFRICA' },
  // { id: 'AN', name: 'Antartide', label: 'ANTARCTICA' },
  { id: 'AS', name: 'Asia', label: 'ASIA' },
  { id: 'EU', name: 'Europa', label: 'EUROPE' },
  { id: 'NA', name: 'Nordamerica', label: 'NORTH_AMERICA' },
  { id: 'OC', name: 'Oceania', label: 'OCEANIA' },
  { id: 'SA', name: 'Sudamerica', label: 'SOUTH_AMERICA' },
];

export const europeanCountries: ListModel[] = [
  // { id: '', name: 'Abcasia', label: '' },
  { id: 'AL', name: 'Albania', label: 'ALBANIA' },
  { id: 'AD', name: 'Andorra', label: 'ANDORRA' },
  { id: 'AM', name: 'Armenia', label: 'ARMENIA' },
  { id: 'AT', name: 'Austria', label: 'AUSTRIA' },
  { id: 'BE', name: 'Belgio', label: 'BELGIUM' },
  { id: 'BY', name: 'Bielorussia', label: 'BELARUS' },
  { id: 'BA', name: 'Bosnia ed Erzegovina', label: 'BOSNIA_AND_HERZEGOVINA' },
  { id: 'BG', name: 'Bulgaria', label: 'BULGARIA' },
  { id: 'CZ', name: 'Cechia', label: 'CZECHIA' },
  { id: 'VA', name: 'Città del Vaticano', label: 'VATICAN_CITY' },
  { id: 'HR', name: 'Croazia', label: 'CROATIA' },
  { id: 'DK', name: 'Danimarca', label: 'DENMARK' },
  { id: 'EE', name: 'Estonia', label: 'ESTONIA' },
  { id: 'FI', name: 'Finlandia', label: 'FINLAND' },
  { id: 'FR', name: 'Francia', label: 'FRANCE' },
  { id: 'DE', name: 'Germania', label: 'GERMANY' },
  { id: 'GR', name: 'Grecia', label: 'GREECE' },
  { id: 'IE', name: 'Irlanda', label: 'IRELAND' },
  { id: 'IS', name: 'Islanda', label: 'ISLAND' },
  { id: 'IT', name: 'Italia', label: 'ITALY' },
  { id: 'KZ', name: 'Kazakistan', label: 'KAZAKHSTAN' },
  // { id: '', name: 'Kosovo', label: '' },
  { id: 'LV', name: 'Lettonia', label: 'LATVIA' },
  { id: 'LI', name: 'Liechtenstein', label: 'LIECHTENSTEIN' },
  { id: 'LT', name: 'Lituania', label: 'LITHUANIA' },
  { id: 'LU', name: 'Lussemburgo', label: 'LUXEMBOURG' },
  { id: 'MK', name: 'Macedonia del Nord', label: 'NORTH_MACEDONIA' },
  { id: 'MT', name: 'Malta', label: 'MALTA' },
  { id: 'MD', name: 'Moldavia', label: 'MOLDAVIA' },
  { id: 'MC', name: 'Monaco', label: 'MONACO' },
  { id: 'ME', name: 'Montenegro', label: 'MONTENEGRO' },
  // { id: '', name: 'Nagorno Karabakh', label: '' },
  { id: 'NO', name: 'Norvegia', label: 'NORWAY' },
  // { id: '', name: 'Ossezia del Sud', label: '' },
  { id: 'NL', name: 'Paesi Bassi', label: 'NETHERLANDS' },
  { id: 'PL', name: 'Polonia', label: 'POLAND' },
  { id: 'PT', name: 'Portogallo', label: 'PORTUGAL' },
  { id: 'UK', name: 'Regno Unito', label: 'UNITED_KINGDOM' },
  // { id: '', name: 'Repubblica Popolare di Doneck', label: '' },
  // { id: '', name: 'Repubblica Popolare di Lugansk', label: '' },
  { id: 'RO', name: 'Romania', label: 'ROMANIA' },
  { id: 'RU', name: 'Russia', label: 'RUSSIA' },
  { id: 'SM', name: 'San Marino', label: 'SAN_MARINO' },
  { id: 'RS', name: 'Serbia', label: 'SERBIA' },
  { id: 'SK', name: 'Slovacchia', label: 'SLOVAKIA' },
  { id: 'SI', name: 'Slovenia', label: 'SLOVENIA' },
  { id: 'ES', name: 'Spagna', label: 'SPAIN' },
  { id: 'SE', name: 'Svezia', label: 'SWEDEN' },
  { id: 'CH', name: 'Svizzera', label: 'SWITZERLAND' },
  // { id: '', name: 'Transnistria', label: '' },
  { id: 'TR', name: 'Turchia', label: 'TURKEY' },
  { id: 'UA', name: 'Ucraina', label: 'UKRAINE' },
  { id: 'HU', name: 'Ungheria', label: 'HUNGARY' },
];

export const northAmericanCountries: ListModel[] = [
  { id: 'AG', name: 'Antigua e Barbuda', label: 'ANTIGUA_AND_BARBUDA' },
  { id: 'BS', name: 'Bahamas', label: 'BAHAMAS' },
  { id: 'BB', name: 'Barbados', label: 'BARBADOS' },
  { id: 'BZ', name: 'Belize', label: 'BELIZE' },
  { id: 'CA', name: 'Canada', label: 'CANADA' },
  { id: 'CR', name: 'Costa Rica', label: 'COSTA_RICA' },
  { id: 'CU', name: 'Cuba', label: 'CUBA' },
  { id: 'DM', name: 'Dominica', label: 'DOMINICA' },
  { id: 'SV', name: 'El Salvador', label: 'EL_SALVADOR' },
  { id: 'JM', name: 'Giamaica', label: 'JAMAICA' },
  { id: 'GD', name: 'Grenada', label: 'GRENADA' },
  { id: 'GT', name: 'Guatemala', label: 'GUATEMALA' },
  { id: 'HT', name: 'Haiti', label: 'HAITI' },
  { id: 'HN', name: 'Honduras', label: 'HONDURAS' },
  { id: 'MX', name: 'Messico', label: 'MEXICO' },
  { id: 'NI', name: 'Nicaragua', label: 'NICARAGUA' },
  { id: 'PA', name: 'Panama', label: 'PANAMA' },
  { id: 'DO', name: 'Repubblica Dominicana', label: 'DOMINICAN_REPUBLIC' },
  { id: 'KN', name: 'Saint Kitts e Nevis', label: 'SAINT_KITTS_AND_NEVIS' },
  { id: 'VC', name: 'Saint Vincent e Grenadine', label: 'SAINT_VINCENT_AND_THE_GRENADINES' },
  { id: 'LC', name: 'Santa Lucia', label: 'SAINT_LUCIA' },
  { id: 'US', name: 'Stati Uniti d\'America', label: 'UNITED_STATES_OF_AMERICA' },
  { id: 'TT', name: 'Trinidad e Tobago', label: 'TRINIDAD_AND_TOBAGO' },
];

export const countries: ListModel[] = [
  { id: 'AF', name: 'Afghanistan' },
  { id: 'AX', name: 'Åland Islands' },
  { id: 'AL', name: 'Albania' },
  { id: 'DZ', name: 'Algeria' },
  { id: 'AS', name: 'American Samoa' },
  { id: 'AD', name: 'Andorra' },
  { id: 'AO', name: 'Angola' },
  { id: 'AI', name: 'Anguilla' },
  { id: 'AQ', name: 'Antarctica' },
  { id: 'AG', name: 'Antigua and Barbuda' },
  { id: 'AR', name: 'Argentina' },
  { id: 'AM', name: 'Armenia' },
  { id: 'AW', name: 'Aruba' },
  { id: 'AU', name: 'Australia' },
  { id: 'AT', name: 'Austria' },
  { id: 'AZ', name: 'Azerbaijan' },
  { id: 'BS', name: 'Bahamas' },
  { id: 'BH', name: 'Bahrain' },
  { id: 'BD', name: 'Bangladesh' },
  { id: 'BB', name: 'Barbados' },
  { id: 'BY', name: 'Belarus' },
  { id: 'BE', name: 'Belgium' },
  { id: 'BZ', name: 'Belize' },
  { id: 'BJ', name: 'Benin' },
  { id: 'BM', name: 'Bermuda' },
  { id: 'BT', name: 'Bhutan' },
  { id: 'BO', name: 'Bolivia' },
  { id: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
  { id: 'BA', name: 'Bosnia and Herzegovina' },
  { id: 'BW', name: 'Botswana' },
  { id: 'BV', name: 'Bouvet Island' },
  { id: 'BR', name: 'Brazil' },
  { id: 'IO', name: 'British Indian Ocean Territory' },
  { id: 'BN', name: 'Brunei Darussalam' },
  { id: 'BG', name: 'Bulgaria' },
  { id: 'BF', name: 'Burkina Faso' },
  { id: 'BI', name: 'Burundi' },
  { id: 'KH', name: 'Cambodia' },
  { id: 'CM', name: 'Cameroon' },
  { id: 'CA', name: 'Canada' },
  { id: 'CV', name: 'Cape Verde' },
  { id: 'KY', name: 'Cayman Islands' },
  { id: 'CF', name: 'Central African Republic' },
  { id: 'TD', name: 'Chad' },
  { id: 'CL', name: 'Chile' },
  { id: 'CN', name: 'China' },
  { id: 'CX', name: 'Christmas Island' },
  { id: 'CC', name: 'Cocos (Keeling) Islands' },
  { id: 'CO', name: 'Colombia' },
  { id: 'KM', name: 'Comoros' },
  { id: 'CG', name: 'Congo' },
  { id: 'CD', name: 'Congo, the Democratic Republic of the' },
  { id: 'CK', name: 'Cook Islands' },
  { id: 'CR', name: 'Costa Rica' },
  { id: 'CI', name: 'Côte d\'Ivoire' },
  { id: 'HR', name: 'Croatia' },
  { id: 'CU', name: 'Cuba' },
  { id: 'CW', name: 'Curaçao' },
  { id: 'CY', name: 'Cyprus' },
  { id: 'CZ', name: 'Czech Republic' },
  { id: 'DK', name: 'Denmark' },
  { id: 'DJ', name: 'Djibouti' },
  { id: 'DM', name: 'Dominica' },
  { id: 'DO', name: 'Dominican Republic' },
  { id: 'EC', name: 'Ecuador' },
  { id: 'EG', name: 'Egypt' },
  { id: 'SV', name: 'El Salvador' },
  { id: 'GQ', name: 'Equatorial Guinea' },
  { id: 'ER', name: 'Eritrea' },
  { id: 'EE', name: 'Estonia' },
  { id: 'ET', name: 'Ethiopia' },
  { id: 'FK', name: 'Falkland Islands (Malvinas)' },
  { id: 'FO', name: 'Faroe Islands' },
  { id: 'FJ', name: 'Fiji' },
  { id: 'FI', name: 'Finland' },
  { id: 'FR', name: 'France' },
  { id: 'GF', name: 'French Guiana' },
  { id: 'PF', name: 'French Polynesia' },
  { id: 'TF', name: 'French Southern Territories' },
  { id: 'GA', name: 'Gabon' },
  { id: 'GM', name: 'Gambia' },
  { id: 'GE', name: 'Georgia' },
  { id: 'DE', name: 'Germany' },
  { id: 'GH', name: 'Ghana' },
  { id: 'GI', name: 'Gibraltar' },
  { id: 'GR', name: 'Greece' },
  { id: 'GL', name: 'Greenland' },
  { id: 'GD', name: 'Grenada' },
  { id: 'GP', name: 'Guadeloupe' },
  { id: 'GU', name: 'Guam' },
  { id: 'GT', name: 'Guatemala' },
  { id: 'GG', name: 'Guernsey' },
  { id: 'GN', name: 'Guinea' },
  { id: 'GW', name: 'Guinea-Bissau' },
  { id: 'GY', name: 'Guyana' },
  { id: 'HT', name: 'Haiti' },
  { id: 'HM', name: 'Heard Island and McDonald Islands' },
  { id: 'VA', name: 'Holy See' },
  { id: 'HN', name: 'Honduras' },
  { id: 'HK', name: 'Hong Kong' },
  { id: 'HU', name: 'Hungary' },
  { id: 'IS', name: 'Iceland' },
  { id: 'IN', name: 'India' },
  { id: 'ID', name: 'Indonesia' },
  { id: 'IR', name: 'Iran' },
  { id: 'IQ', name: 'Iraq' },
  { id: 'IE', name: 'Ireland' },
  { id: 'IM', name: 'Isle of Man' },
  { id: 'IL', name: 'Israel' },
  { id: 'IT', name: 'Italy' },
  { id: 'JM', name: 'Jamaica' },
  { id: 'JP', name: 'Japan' },
  { id: 'JE', name: 'Jersey' },
  { id: 'JO', name: 'Jordan' },
  { id: 'KZ', name: 'Kazakhstan' },
  { id: 'KE', name: 'Kenya' },
  { id: 'KI', name: 'Kiribati' },
  { id: 'KP', name: 'Korea (North)' },
  { id: 'KR', name: 'Korea (South)' },
  { id: 'KW', name: 'Kuwait' },
  { id: 'KG', name: 'Kyrgyzstan' },
  { id: 'LA', name: 'Lao' },
  { id: 'LV', name: 'Latvia' },
  { id: 'LB', name: 'Lebanon' },
  { id: 'LS', name: 'Lesotho' },
  { id: 'LR', name: 'Liberia' },
  { id: 'LY', name: 'Libya' },
  { id: 'LI', name: 'Liechtenstein' },
  { id: 'LT', name: 'Lithuania' },
  { id: 'LU', name: 'Luxembourg' },
  { id: 'MO', name: 'Macao' },
  { id: 'MK', name: 'Macedonia' },
  { id: 'MG', name: 'Madagascar' },
  { id: 'MW', name: 'Malawi' },
  { id: 'MY', name: 'Malaysia' },
  { id: 'MV', name: 'Maldives' },
  { id: 'ML', name: 'Mali' },
  { id: 'MT', name: 'Malta' },
  { id: 'MH', name: 'Marshall Islands' },
  { id: 'MQ', name: 'Martinique' },
  { id: 'MR', name: 'Mauritania' },
  { id: 'MU', name: 'Mauritius' },
  { id: 'YT', name: 'Mayotte' },
  { id: 'MX', name: 'Mexico' },
  { id: 'FM', name: 'Micronesia' },
  { id: 'MD', name: 'Moldova' },
  { id: 'MC', name: 'Monaco' },
  { id: 'MN', name: 'Mongolia' },
  { id: 'ME', name: 'Montenegro' },
  { id: 'MS', name: 'Montserrat' },
  { id: 'MA', name: 'Morocco' },
  { id: 'MZ', name: 'Mozambique' },
  { id: 'MM', name: 'Myanmar' },
  { id: 'NA', name: 'Namibia' },
  { id: 'NR', name: 'Nauru' },
  { id: 'NP', name: 'Nepal' },
  { id: 'NL', name: 'Netherlands' },
  { id: 'NC', name: 'New Caledonia' },
  { id: 'NZ', name: 'New Zealand' },
  { id: 'NI', name: 'Nicaragua' },
  { id: 'NE', name: 'Niger' },
  { id: 'NG', name: 'Nigeria' },
  { id: 'NU', name: 'Niue' },
  { id: 'NF', name: 'Norfolk Island' },
  { id: 'MP', name: 'Northern Mariana Islands' },
  { id: 'NO', name: 'Norway' },
  { id: 'OM', name: 'Oman' },
  { id: 'PK', name: 'Pakistan' },
  { id: 'PW', name: 'Palau' },
  { id: 'PS', name: 'Palestinian Territory' },
  { id: 'PA', name: 'Panama' },
  { id: 'PG', name: 'Papua New Guinea' },
  { id: 'PY', name: 'Paraguay' },
  { id: 'PE', name: 'Peru' },
  { id: 'PH', name: 'Philippines' },
  { id: 'PN', name: 'Pitcairn' },
  { id: 'PL', name: 'Poland' },
  { id: 'PT', name: 'Portugal' },
  { id: 'PR', name: 'Puerto Rico' },
  { id: 'QA', name: 'Qatar' },
  { id: 'RE', name: 'Réunion' },
  { id: 'RO', name: 'Romania' },
  { id: 'RU', name: 'Russian Federation' },
  { id: 'RW', name: 'Rwanda' },
  { id: 'BL', name: 'Saint Barthélemy' },
  { id: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
  { id: 'KN', name: 'Saint Kitts and Nevis' },
  { id: 'LC', name: 'Saint Lucia' },
  { id: 'MF', name: 'Saint Martin (French part)' },
  { id: 'PM', name: 'Saint Pierre and Miquelon' },
  { id: 'VC', name: 'Saint Vincent and the Grenadines' },
  { id: 'WS', name: 'Samoa' },
  { id: 'SM', name: 'San Marino' },
  { id: 'ST', name: 'Sao Tome and Principe' },
  { id: 'SA', name: 'Saudi Arabia' },
  { id: 'SN', name: 'Senegal' },
  { id: 'RS', name: 'Serbia' },
  { id: 'SC', name: 'Seychelles' },
  { id: 'SL', name: 'Sierra Leone' },
  { id: 'SG', name: 'Singapore' },
  { id: 'SX', name: 'Sint Maarten (Dutch part)' },
  { id: 'SK', name: 'Slovakia' },
  { id: 'SI', name: 'Slovenia' },
  { id: 'SB', name: 'Solomon Islands' },
  { id: 'SO', name: 'Somalia' },
  { id: 'ZA', name: 'South Africa' },
  { id: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { id: 'SS', name: 'South Sudan' },
  { id: 'ES', name: 'Spain' },
  { id: 'LK', name: 'Sri Lanka' },
  { id: 'SD', name: 'Sudan' },
  { id: 'SR', name: 'Suriname' },
  { id: 'SJ', name: 'Svalbard and Jan Mayen' },
  { id: 'SZ', name: 'Swaziland' },
  { id: 'SE', name: 'Sweden' },
  { id: 'CH', name: 'Switzerland' },
  { id: 'SY', name: 'Syria' },
  { id: 'TW', name: 'Taiwan' },
  { id: 'TJ', name: 'Tajikistan' },
  { id: 'TZ', name: 'Tanzania' },
  { id: 'TH', name: 'Thailand' },
  { id: 'TL', name: 'Timor-Leste' },
  { id: 'TG', name: 'Togo' },
  { id: 'TK', name: 'Tokelau' },
  { id: 'TO', name: 'Tonga' },
  { id: 'TT', name: 'Trinidad and Tobago' },
  { id: 'TN', name: 'Tunisia' },
  { id: 'TR', name: 'Turkey' },
  { id: 'TM', name: 'Turkmenistan' },
  { id: 'TC', name: 'Turks and Caicos Islands' },
  { id: 'TV', name: 'Tuvalu' },
  { id: 'UG', name: 'Uganda' },
  { id: 'UA', name: 'Ukraine' },
  { id: 'AE', name: 'United Arab Emirates' },
  { id: 'GB', name: 'United Kingdom' },
  { id: 'US', name: 'United States' },
  { id: 'UM', name: 'United States Minor Outlying Islands' },
  { id: 'UY', name: 'Uruguay' },
  { id: 'UZ', name: 'Uzbekistan' },
  { id: 'VU', name: 'Vanuatu' },
  { id: 'VE', name: 'Venezuela' },
  { id: 'VN', name: 'Viet Nam' },
  { id: 'VG', name: 'Virgin Islands, British' },
  { id: 'VI', name: 'Virgin Islands, U.S.' },
  { id: 'WF', name: 'Wallis and Futuna' },
  { id: 'EH', name: 'Western Sahara' },
  { id: 'YE', name: 'Yemen' },
  { id: 'ZM', name: 'Zambia' },
  { id: 'ZW', name: 'Zimbabwe' },
];

export const italianProvinces: ListModel[] = [
  { id: 'AG', name: 'Agrigento' },
  { id: 'AL', name: 'Alessandria' },
  { id: 'AN', name: 'Ancona' },
  { id: 'AO', name: 'Aosta' },
  { id: 'AR', name: 'Arezzo' },
  { id: 'AP', name: 'Ascoli Piceno' },
  { id: 'AT', name: 'Asti' },
  { id: 'AV', name: 'Avellino' },
  { id: 'BA', name: 'Bari' },
  { id: 'BT', name: 'Barletta-Andria-Trani' },
  { id: 'BL', name: 'Belluno' },
  { id: 'BN', name: 'Benevento' },
  { id: 'BG', name: 'Bergamo' },
  { id: 'BI', name: 'Biella' },
  { id: 'BO', name: 'Bologna' },
  { id: 'BZ', name: 'Bolzano' },
  { id: 'BS', name: 'Brescia' },
  { id: 'BR', name: 'Brindisi' },
  { id: 'CA', name: 'Cagliari' },
  { id: 'CL', name: 'Caltanissetta' },
  { id: 'CB', name: 'Campobasso' },
  { id: 'CI', name: 'Carbonia-Iglesias' },
  { id: 'CE', name: 'Caserta' },
  { id: 'CT', name: 'Catania' },
  { id: 'CZ', name: 'Catanzaro' },
  { id: 'CH', name: 'Chieti' },
  { id: 'CO', name: 'Como' },
  { id: 'CS', name: 'Cosenza' },
  { id: 'CR', name: 'Cremona' },
  { id: 'KR', name: 'Crotone' },
  { id: 'CN', name: 'Cuneo' },
  { id: 'EN', name: 'Enna' },
  { id: 'FM', name: 'Fermo' },
  { id: 'FE', name: 'Ferrara' },
  { id: 'FI', name: 'Firenze' },
  { id: 'FG', name: 'Foggia' },
  { id: 'FC', name: 'Forlì-Cesena' },
  { id: 'FR', name: 'Frosinone' },
  { id: 'GE', name: 'Genova' },
  { id: 'GO', name: 'Gorizia' },
  { id: 'GR', name: 'Grosseto' },
  { id: 'IM', name: 'Imperia' },
  { id: 'IS', name: 'Isernia' },
  { id: 'SP', name: 'La Spezia' },
  { id: 'AQ', name: 'L\'Aquila' },
  { id: 'LT', name: 'Latina' },
  { id: 'LE', name: 'Lecce' },
  { id: 'LC', name: 'Lecco' },
  { id: 'LI', name: 'Livorno' },
  { id: 'LO', name: 'Lodi' },
  { id: 'LU', name: 'Lucca' },
  { id: 'MC', name: 'Macerata' },
  { id: 'MN', name: 'Mantova' },
  { id: 'MS', name: 'Massa-Carrara' },
  { id: 'MT', name: 'Matera' },
  { id: 'ME', name: 'Messina' },
  { id: 'MI', name: 'Milano' },
  { id: 'MO', name: 'Modena' },
  { id: 'MB', name: 'Monza e della Brianza' },
  { id: 'NA', name: 'Napoli' },
  { id: 'NO', name: 'Novara' },
  { id: 'NU', name: 'Nuoro' },
  { id: 'OT', name: 'Olbia-Tempio' },
  { id: 'OR', name: 'Oristano' },
  { id: 'PD', name: 'Padova' },
  { id: 'PA', name: 'Palermo' },
  { id: 'PR', name: 'Parma' },
  { id: 'PV', name: 'Pavia' },
  { id: 'PG', name: 'Perugia' },
  { id: 'PU', name: 'Pesaro e Urbino' },
  { id: 'PE', name: 'Pescara' },
  { id: 'PC', name: 'Piacenza' },
  { id: 'PI', name: 'Pisa' },
  { id: 'PT', name: 'Pistoia' },
  { id: 'PN', name: 'Pordenone' },
  { id: 'PZ', name: 'Potenza' },
  { id: 'PO', name: 'Prato' },
  { id: 'RG', name: 'Ragusa' },
  { id: 'RA', name: 'Ravenna' },
  { id: 'RC', name: 'Reggio Calabria' },
  { id: 'RE', name: 'Reggio Emilia' },
  { id: 'RI', name: 'Rieti' },
  { id: 'RN', name: 'Rimini' },
  { id: 'RM', name: 'Roma' },
  { id: 'RO', name: 'Rovigo' },
  { id: 'SA', name: 'Salerno' },
  { id: 'VS', name: 'Medio Campidano' },
  { id: 'SS', name: 'Sassari' },
  { id: 'SV', name: 'Savona' },
  { id: 'SI', name: 'Siena' },
  { id: 'SR', name: 'Siracusa' },
  { id: 'SO', name: 'Sondrio' },
  { id: 'TA', name: 'Taranto' },
  { id: 'TE', name: 'Teramo' },
  { id: 'TR', name: 'Terni' },
  { id: 'TO', name: 'Torino' },
  { id: 'OG', name: 'Ogliastra' },
  { id: 'TP', name: 'Trapani' },
  { id: 'TN', name: 'Trento' },
  { id: 'TV', name: 'Treviso' },
  { id: 'TS', name: 'Trieste' },
  { id: 'UD', name: 'Udine' },
  { id: 'VA', name: 'Varese' },
  { id: 'VE', name: 'Venezia' },
  { id: 'VB', name: 'Verbano-Cusio-Ossola' },
  { id: 'VC', name: 'Vercelli' },
  { id: 'VR', name: 'Verona' },
  { id: 'VV', name: 'Vibo Valentia' },
  { id: 'VI', name: 'Vicenza' },
  { id: 'VT', name: 'Viterbo' }
];

export const authors: string[] = [
  'Abd al-Rahman Munif', 
  'Adrian Fartade', 
  'Agatha Christie', 
  'Ahmet Altan', 
  'Alberto Angela', 
  'Alessandro Baricco', 
  'Alessandro Piperno', 
  'Alice Munro', 
  'Amedeo Balbi', 
  'Amin Maalouf', 
  'Amos Oz', 
  'Andrea Camilleri', 
  'Ann Leckie', 
  'Anne Frank', 
  'Antonia Susan Byatt', 
  'Antonio Scurati', 
  'Antonio Tabucchi', 
  'Arthur C Clarke', 
  'Arthur Conan Doyle', 
  'Barbascura X', 
  'Beatrice Mautino', 
  'Bei Dao', 
  'Ben Okri', 
  'Camilla Läckberg', 
  'Carlo Rovelli', 
  'Carlos Fuentes', 
  'Carlos Ruiz Zafón', 
  'Charles Bukowski', 
  'Charles Darwin', 
  'Charles Dickens', 
  'Charles Stross', 
  'Christa Wolf', 
  'Cinzia Giorgio', 
  'Clive Cussler', 
  'Cory Doctorow', 
  'Costantino D\'Orazio', 
  'Dan Brown', 
  'Daniel Kahneman', 
  'Dario Bressanini', 
  'David Attenborough', 
  'David Foster Wallace', 
  'David Quammen', 
  'Diana Gabaldon', 
  'Dino Buzzati', 
  'Dino Olivieri', 
  'Donato Carrisi', 
  'Edgar Allan Poe',
  'Elena Ferrante', 
  'Elsa Morante', 
  'Emilio Salgari', 
  'Emily Dickinson', 
  'Ernest Hemingway', 
  'Erri De Luca', 
  'Francis Scott Fitzgerald', 
  'Frank Herbert', 
  'Frank Schätzing', 
  'Franz Kafka', 
  'Fëdor Dostoevskij', 
  'Gabriel García Márquez', 
  'Gabriella Greison', 
  'George Orwell', 
  'George RR Martin', 
  'Gerold Späth', 
  'Gianrico Carofiglio', 
  'Gilbert Sinoué', 
  'Giuseppe Culicchia', 
  'Graham Swift', 
  'HG Wells', 
  'Harper Lee', 
  'Haruki Murakami', 
  'Honoré de Balzac', 
  'Howard Phillips Lovecraft', 
  'Isaac Asimov', 
  'Isabel Allende', 
  'Italo Calvino', 
  'JD Salinger', 
  'JK Rowling', 
  'JRR Tolkien', 
  'Jack London', 
  'James Joyce', 
  'James Rollins', 
  'James SA Corey', 
  'Jane Austen', 
  'Janet Frame', 
  'Jared Diamond', 
  'Jeffery Deaver', 
  'Jennifer Egan', 
  'Jim Al-Khalili', 
  'Johann Wolfgang Goethe', 
  'John Grisham', 
  'John Irving',
  'John le Carré',  
  'Jojo Moyes', 
  'Jonathan Safran Foer', 
  'Jules Verne', 
  'Julian Barnes', 
  'Ken Follett', 
  'Kjartan Fløgstad', 
  'Kurt Vonnegut', 
  'Lee Child', 
  'Lev Nikolaevič Tolstoj', 
  'Lewis Carroll', 
  'Licia Troisi', 
  'Liliana Segre', 
  'Liza Marklund', 
  'Luca Perri', 
  'Luigi Pirandello', 
  'Luis Sepúlveda', 
  'Mahmoud Dowlatabadi', 
  'Manuel Vázquez Montalbán', 
  'Marcel Proust', 
  'Marco Balzano', 
  'Margaret Atwood', 
  'Margaret Mitchell', 
  'Maria Montessori', 
  'Martha Cerda', 
  'Mary Shelley', 
  'Massimo Polidoro', 
  'Matthew Reilly', 
  'Michael Connelly', 
  'Michel Tournier', 
  'Milan Kundera', 
  'Nadine Gordimer', 
  'Nawal al-Sa\'dawi', 
  'Niccolò Ammaniti', 
  'Nihad Sirees', 
  'Norman Mailer', 
  'Nuruddin Farah', 
  'Oliver Sacks', 
  'Oriana Fallaci', 
  'Orphan Pamuk', 
  'Oscar Wilde', 
  'Paola Mastrocola', 
  'Paolo Cognetti', 
  'Paolo Giordano', 
  'Philip K Dick', 
  'Philip Roth', 
  'Piergiorgio Odifreddi', 
  'Piero Angela', 
  'Platone', 
  'Primo Levi', 
  'Richard Dawkins', 
  'Richard K Morgan', 
  'Robert Bly', 
  'Roberto Burioni', 
  'Roberto Saviano', 
  'Rosella Postorino', 
  'Salman Rushdie', 
  'Sandrone Dazieri', 
  'Sara Paretsky', 
  'Sigmund Freud', 
  'Simonetta Agnello Hornby', 
  'Socrate', 
  'Spôjmaï Zariâb', 
  'Stefano Liberti', 
  'Stephen King', 
  'Stephenie Meyer', 
  'Susan Sontag', 
  'Susanna Tamaro', 
  'Suzanne Collins', 
  'Telmo Pievani', 
  'Tiziano Terzani', 
  'Tom Clancy', 
  'Toni Morrison', 
  'Tracy Chevalier', 
  'Ugo Foscolo', 
  'Umberto Eco', 
  'Valerio Massimo Manfredi', 
  'Victor Hugo', 
  'Virginia Woolf', 
  'Vladimir Nabokov', 
  'Wilbur Smith', 
  'William Shakespeare', 
  'Woody Allen', 
  'Yu Hua', 
  'Yuval Noah Harari', 
  'Zerocalcare', 
];

export const badWords: string[] = [
  'bocchinara',
  'bocchinaro',
  'cagare', 
  'cagata', 
  'cagate',
  'cazzaro', 
  'cazzata', 
  'cazzate',
  'cazzi', 
  'cazzo', 
  'cazzone', 
  'cazzoni',
  'coglionando', 
  'coglionare', 
  'coglionata',
  'coglionazzo', 
  'coglionazzi',
  'coglione', 
  'coglioni',
  'culattone', 
  'culattoni',
  'fanculo', 
  'ficcatelo', 
  'fottere', 
  'fottiti', 
  'fottuta', 
  'fottuto', 
  'froci',
  'frocio', 
  'fuck', 
  'fucked',
  'fucking',
  'inculare',
  'merda',
  'merde',
  'merdoso',
  'minchiata', 
  'minchiate',
  'minchione', 
  'minchioni',
  // 'puttana', 
  'puttanata',
  // 'puttane',
  'puttaniere', 
  'puttanieri',
  'rottinculo', 
  'sborra',
  'sborrare',
  'sborrata',
  'sfanculare', 
  'stronzata', 
  'stronzate', 
  'stronzo', 
  'stronzi', 
  'suca', 
  'sucare', 
  'sucata',
  'sucamelo', 
  'succhiamelo', 
  'troiaio', 
  'troie', 
  'vaffanculo'
];

export const collections: string[] = [
  'After', 
  'Alla ricerca del tempo perduto', 
  'Aloysius Pendergast', 
  'Best seller', 
  'Ciclo dello Spazio conosciuto', 
  'Cronache del ghiaccio e del fuoco', 
  'Fenoglio', 
  'Fjällbacka', 
  'Guida galattica per gli autostoppisti', 
  'Harry Potter', 
  'I casi di Girolamo Svampa', 
  'Il ciclo di Malaussène', 
  'Il cimitero dei libri dimenticati', 
  'Il commissario Balistreri', 
  'Il commissario Lolita Lobosco', 
  'Il problema dei tre corpi', 
  'Il vicequestore Rocco Schiavone', 
  'Indomite', 
  'Kingsbridge', 
  'L\'allieva', 
  'L\'amica geniale', 
  'L\'attraversaspecchi', 
  'La torre nera', 
  'Le avventure di Jack Reacher', 
  'Le inchieste di Annika Bengtzon', 
  'Le indagini di Lincoln Rhyme', 
  'Le indagini di Pepe Carvalho', 
  'Libri proibiti', 
  'Lorien Legacies', 
  'Millennium', 
  'Miss Peregrine', 
  'Montalbano', 
  'Outlander', 
  'Pathfinder', 
  'Percy Jackson e gli dei dell\'Olimpo', 
  'Premio Strega', 
  'Stranger Things', 
  'The Expanse', 
  'The Wicked + The Divine', 
  'Trilogia dell\'Area X', 
  'Twilight', 
  'Un viaggio attraverso', 
  'Un\'indagine per Vani', 
  'Wild Cards', 
];

export const publishers: string [] = [
  'Adelphi Edizioni', 
  'Apogeo',  
  'Bao Publishing', 
  'Bompiani Editore', 
  'Bur',
  'Cairo Editore', 
  'Chiarelettere', 
  'De Agostini Editore', 
  'Del Vecchio editore', 
  'Editori Riuniti', 
  'Fandango', 
  'Fanucci Editore', 
  'Fazi editore', 
  'Feltrinelli Editore', 
  'Garzanti Editore', 
  'Giulio Einaudi Editore', 
  'Giunti Editore', 
  'HarperCollins Italia Editore', 
  'Hoepli Editore', 
  'ISBN Edizioni', 
  'La Corte editore', 
  'La scuola Editrice', 
  'Laterza Editore', 
  'Marisilio',
  'Mauri Spagnol Editori', 
  'Mondadori',
  'Rizzoli', 
  'Rusconi libri Editore',
  'Sperling & Kupfer',
];