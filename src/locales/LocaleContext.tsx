import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Locale, getTranslation, getNestedTranslation, TranslationKeys } from './index';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => any;
  tn: (key: string) => string; // for nested translations
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en'); // Default to English

  const t = (key: TranslationKeys) => getTranslation(locale, key);
  const tn = (key: string) => getNestedTranslation(locale, key);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, tn }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}; 