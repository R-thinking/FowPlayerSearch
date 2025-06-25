import { en } from './en';
import { ko } from './ko';

export type Locale = 'en' | 'ko';

export const translations = {
  en,
  ko
};

export type TranslationKeys = keyof typeof en;

export const getTranslation = (locale: Locale, key: TranslationKeys): any => {
  return translations[locale][key] || translations.en[key] || key;
};

export const getNestedTranslation = (locale: Locale, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}; 