/**
 * Language selector component for dual-language lessons
 * Allows users to switch between Python, JavaScript, and TypeScript
 */

import { type Language } from '@professor-pixel/types';

export interface LanguageSelectorProps {
  currentLanguage: Language;
  availableLanguages: Language[];
  onLanguageChange: (language: Language) => void;
  disabled?: boolean;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  python: '🐍 Python',
  javascript: '📜 JavaScript',
  typescript: '📘 TypeScript',
};

const LANGUAGE_COLORS: Record<Language, string> = {
  python: 'bg-blue-500 hover:bg-blue-600',
  javascript: 'bg-yellow-500 hover:bg-yellow-600',
  typescript: 'bg-blue-700 hover:bg-blue-800',
};

export function LanguageSelector({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  if (availableLanguages.length <= 1) {
    // No need for selector if only one language available
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
      <span className="px-2 text-sm font-medium text-gray-700">Language:</span>
      <div className="flex gap-1">
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onLanguageChange(lang)}
            disabled={disabled}
            className={`
              rounded px-3 py-1 text-sm font-medium text-white transition-all
              ${
                lang === currentLanguage
                  ? LANGUAGE_COLORS[lang]
                  : 'bg-gray-400 hover:bg-gray-500'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            aria-current={lang === currentLanguage}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
