/**
 * Side-by-side language comparison view
 * Shows equivalent code in Python and JavaScript/TypeScript
 */

import { type LanguageCodeContent } from '@professor-pixel/types';

export interface LanguageComparisonViewProps {
  pythonCode: LanguageCodeContent;
  jsCode: LanguageCodeContent;
  title?: string;
  description?: string;
}

/**
 * Displays Python and JavaScript code side-by-side for learning comparison
 */
export function LanguageComparisonView({
  pythonCode,
  jsCode,
  title = 'Language Comparison',
  description,
}: LanguageComparisonViewProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-300 bg-white p-6 shadow-lg">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Python Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-t-lg bg-blue-500 px-4 py-2">
            <span className="text-2xl">🐍</span>
            <span className="font-semibold text-white">Python</span>
          </div>
          <pre className="overflow-x-auto rounded-b-lg bg-gray-900 p-4 text-sm text-gray-100">
            <code>{pythonCode.solution || pythonCode.initialCode}</code>
          </pre>
        </div>

        {/* JavaScript Column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-t-lg bg-yellow-500 px-4 py-2">
            <span className="text-2xl">📜</span>
            <span className="font-semibold text-white">
              {jsCode.language === 'typescript' ? 'TypeScript' : 'JavaScript'}
            </span>
          </div>
          <pre className="overflow-x-auto rounded-b-lg bg-gray-900 p-4 text-sm text-gray-100">
            <code>{jsCode.solution || jsCode.initialCode}</code>
          </pre>
        </div>
      </div>

      {/* Comparison Notes */}
      <div className="rounded-lg bg-purple-50 p-4">
        <h4 className="font-semibold text-purple-900">🔍 Key Differences</h4>
        <ul className="mt-2 space-y-1 text-sm text-purple-800">
          <li>
            • <strong>Syntax:</strong> Python uses indentation, JavaScript uses braces{' '}
            {'{}'}
          </li>
          <li>
            • <strong>Variables:</strong> Python has dynamic typing, JavaScript/TypeScript
            can be typed
          </li>
          <li>
            • <strong>Functions:</strong> Python uses <code>def</code>, JavaScript uses{' '}
            <code>function</code> or arrow functions
          </li>
          <li>
            • <strong>Print:</strong> Python uses <code>print()</code>, JavaScript uses{' '}
            <code>console.log()</code>
          </li>
        </ul>
      </div>

      {/* Hints Comparison */}
      {(pythonCode.hints.length > 0 || jsCode.hints.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h5 className="font-semibold text-blue-700">Python Hints</h5>
            <ul className="mt-1 space-y-1">
              {pythonCode.hints.map((hint, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {index + 1}. {hint}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-yellow-700">JavaScript Hints</h5>
            <ul className="mt-1 space-y-1">
              {jsCode.hints.map((hint, index) => (
                <li key={index} className="text-sm text-gray-700">
                  {index + 1}. {hint}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
