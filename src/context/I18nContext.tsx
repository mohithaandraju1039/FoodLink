import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, LANGUAGES } from '../i18n/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('foodlink_language') as Language;
    return saved && translations[saved] ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('foodlink_language', lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations['en'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    // Return key if no translation found
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
