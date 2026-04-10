/**
 * Dual-language code editor component
 * Supports switching between Python, JavaScript, and TypeScript
 */

import { useState, useEffect } from 'react';
import { type Language, type LanguageCodeContent } from '@professor-pixel/types';
import { LanguageSelector } from './LanguageSelector';

export interface DualLanguageCodeEditorProps {
  /**
   * Language-specific content (initialCode, solution, hints)
   */
  implementations: Record<Language, LanguageCodeContent>;
  /**
   * Currently selected language
   */
  currentLanguage: Language;
  /**
   * Callback when language changes
   */
  onLanguageChange: (language: Language) => void;
  /**
   * Callback when code changes
   */
  onCodeChange: (code: string, language: Language) => void;
  /**
   * Current code value
   */
  value: string;
  /**
   * Whether the editor is read-only
   */
  readOnly?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Language-aware code editor with built-in language switching
 */
export function DualLanguageCodeEditor({
  implementations,
  currentLanguage,
  onLanguageChange,
  onCodeChange,
  value,
  readOnly = false,
  className = '',
}: DualLanguageCodeEditorProps) {
  const [localValue, setLocalValue] = useState(value);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Get available languages from implementations
  const availableLanguages = Object.keys(implementations) as Language[];

  // Handle language switch
  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
    // Load the initial code for the new language
    const newImplementation = implementations[newLanguage];
    if (newImplementation) {
      const newCode = newImplementation.initialCode;
      setLocalValue(newCode);
      onCodeChange(newCode, newLanguage);
    }
  };

  // Handle code changes
  const handleCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = event.target.value;
    setLocalValue(newCode);
    onCodeChange(newCode, currentLanguage);
  };

  const currentImplementation = implementations[currentLanguage];

  if (!currentImplementation) {
    return (
      <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
        <p className="font-semibold text-red-700">
          No implementation found for {currentLanguage}
        </p>
        <p className="text-sm text-red-600">
          Available languages: {availableLanguages.join(', ')}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Language Selector */}
      <div className="flex items-center justify-between">
        <LanguageSelector
          currentLanguage={currentLanguage}
          availableLanguages={availableLanguages}
          onLanguageChange={handleLanguageChange}
          disabled={readOnly}
        />

        {/* Hints Badge */}
        {currentImplementation.hints.length > 0 && (
          <span className="text-sm text-gray-600">
            {currentImplementation.hints.length} hint
            {currentImplementation.hints.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {/* Code Editor */}
      <div className="relative flex-1 rounded-lg border border-gray-300 bg-gray-900 font-mono text-sm shadow-lg">
        <textarea
          value={localValue}
          onChange={handleCodeChange}
          readOnly={readOnly}
          className={`
            h-full w-full resize-none rounded-lg bg-transparent p-4 text-gray-100
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${readOnly ? 'cursor-not-allowed opacity-75' : ''}
          `}
          placeholder={`Write your ${currentLanguage} code here...`}
          spellCheck={false}
          style={{
            minHeight: '300px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.6',
            tabSize: currentLanguage === 'python' ? 4 : 2,
          }}
        />

        {/* Language indicator badge */}
        <div className="absolute right-2 top-2 rounded bg-gray-800 px-2 py-1 text-xs font-semibold text-gray-300 opacity-60">
          {currentLanguage.toUpperCase()}
        </div>
      </div>

      {/* Hints Section (collapsible) */}
      {currentImplementation.hints.length > 0 && (
        <details className="rounded-lg border border-gray-300 bg-yellow-50">
          <summary className="cursor-pointer px-4 py-2 font-medium text-yellow-800">
            💡 Hints ({currentImplementation.hints.length})
          </summary>
          <ul className="space-y-1 border-t border-yellow-200 px-4 py-3">
            {currentImplementation.hints.map((hint, index) => (
              <li key={index} className="text-sm text-yellow-900">
                <span className="font-semibold">#{index + 1}:</span> {hint}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
