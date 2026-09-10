import React from 'react';
import { useI18n } from '../../context/I18nContext';
import { Language } from '../../types';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, languages } = useI18n();

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-hover text-content-main text-xs font-medium transition-colors">
        <Globe className="w-4 h-4 text-brand-500" />
        <span>{languages.find((l) => l.code === language)?.nativeName || 'English'}</span>
      </button>

      <div className="absolute right-0 top-full mt-1.5 w-48 max-h-72 overflow-y-auto bg-surface-card border border-surface-border rounded-xl shadow-xl p-1.5 hidden group-hover:block z-50">
        <div className="text-[11px] font-semibold text-content-muted px-2.5 py-1 uppercase tracking-wider">
          Language / 📊 15 Languages
        </div>
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
              language === l.code
                ? 'bg-brand-50 text-brand-700 font-bold'
                : 'hover:bg-surface-hover text-content-main'
            }`}
          >
            <span>{l.nativeName}</span>
            <span className="text-[10px] text-content-muted uppercase">{l.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
