import locale_en_US from 'date-fns/locale/en-US';
import locale_it_IT from 'date-fns/locale/it';
import type { FormatFunction } from 'i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import 'moment/locale/it';
import { initReactI18next } from 'react-i18next';
import { abbrNum } from './config/shared';
import type { Language } from './types';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false,
  }
}

export const supportedLanguages: Language[] = [{
  id: 'it',
  label: 'Italiano',
  locale: locale_it_IT,
}, {
  id: 'en',
  label: 'English',
  locale: locale_en_US,
}];

export const fallbackLanguage: Language = supportedLanguages[0];

export const getLocale = (): Locale | undefined => {
  const language: string = i18n.language || fallbackLanguage.id;
  return supportedLanguages.find(({ id }: Language): boolean => id === language)?.locale;
};

const format: FormatFunction = (value: unknown, format?: string): string => {
  switch (typeof value) {
    case 'number':
      switch (format) {
        case 'short': return abbrNum(value);
        case 'date': return value ? new Date(value).toLocaleDateString(i18n.language) : '';
        case 'dateTime': return value ? new Date(value).toLocaleString(i18n.language, {
          year: '2-digit',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: undefined,
        }) : '';
        default: return String(value);
      }
    case 'string': 
      switch (format) {
        case 'uppercase': return value.toUpperCase();
        case 'lowercase': return value.toLowerCase();
        default: return value;
      }
    default: return String(value);
  }
};

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
  backend: {
    // translation file path
    loadPath: '/assets/i18n/{{ns}}/{{lng}}.json',
  },
  fallbackLng: fallbackLanguage.id,
  // disabled in production
  debug: false,
  ns: ['common', 'dashboard'],
  nsSeparator: ':',
  interpolation: {
    formatSeparator: ',',
    // not needed for react as it escapes by default
    escapeValue: false,
    format,
  },
  react: {
    useSuspense: false,
  },
  returnNull: false,
});

export default i18n;