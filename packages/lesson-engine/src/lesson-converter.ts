/**
 * Lesson converter utility
 * Converts Python-only lessons to dual-language format with JavaScript equivalents
 */

import type { Lesson, LessonStep, LanguageCodeContent } from '@professor-pixel/types';

/**
 * Python to JavaScript code conversion patterns
 */
const CONVERSION_PATTERNS: Record<string, { pattern: RegExp; replacement: string }[]> =
  {
    // Print statements
    print: [
      { pattern: /print\((.*?)\)/g, replacement: 'console.log($1)' },
      {
        pattern: /print\(f['"](.*)['"]\.format\((.*?)\)\)/g,
        replacement: 'console.log(`$1`)',
      },
      { pattern: /print\(f['"](.*)['"]*/g, replacement: 'console.log(`$1`)' },
    ],

    // Input statements
    input: [
      {
        pattern: /(\w+)\s*=\s*input\(['"](.*)['"]*/g,
        replacement: "const $1 = prompt('$2')",
      },
      {
        pattern: /(\w+)\s*=\s*int\(input\(['"](.*)['"]*/g,
        replacement: "const $1 = parseInt(prompt('$2'))",
      },
      {
        pattern: /(\w+)\s*=\s*float\(input\(['"](.*)['"]*/g,
        replacement: "const $1 = parseFloat(prompt('$2'))",
      },
    ],

    // Variable assignment
    variables: [
      { pattern: /^(\w+)\s*=\s*(['"])(.*)(['"])/gm, replacement: 'let $1 = $2$3$4;' },
      { pattern: /^(\w+)\s*=\s*(\d+)/gm, replacement: 'let $1 = $2;' },
      {
        pattern: /^(\w+)\s*=\s*(True|False)/gm,
        replacement: 'let $1 = $2.toLowerCase();',
      },
    ],

    // Conditional statements
    conditionals: [
      { pattern: /if\s+(.*?):/g, replacement: 'if ($1) {' },
      { pattern: /elif\s+(.*?):/g, replacement: '} else if ($1) {' },
      { pattern: /else:/g, replacement: '} else {' },
      { pattern: /\band\b/g, replacement: '&&' },
      { pattern: /\bor\b/g, replacement: '||' },
      { pattern: /\bnot\b/g, replacement: '!' },
    ],

    // Loops
    loops: [
      {
        pattern: /for\s+(\w+)\s+in\s+range\((\d+)\):/g,
        replacement: 'for (let $1 = 0; $1 < $2; $1++) {',
      },
      {
        pattern: /for\s+(\w+)\s+in\s+range\((\d+),\s*(\d+)\):/g,
        replacement: 'for (let $1 = $2; $1 < $3; $1++) {',
      },
      { pattern: /while\s+(.*?):/g, replacement: 'while ($1) {' },
    ],

    // Functions
    functions: [
      {
        pattern: /def\s+(\w+)\((.*?)\):/g,
        replacement: 'function $1($2) {',
      },
      { pattern: /return\s+/g, replacement: 'return ' },
    ],

    // Lists/Arrays
    arrays: [
      { pattern: /\[\s*(.*?)\s*\]/g, replacement: '[$1]' },
      { pattern: /\.append\((.*?)\)/g, replacement: '.push($1)' },
      { pattern: /len\((.*?)\)/g, replacement: '$1.length' },
    ],

    // String methods
    strings: [
      { pattern: /\.upper\(\)/g, replacement: '.toUpperCase()' },
      { pattern: /\.lower\(\)/g, replacement: '.toLowerCase()' },
      { pattern: /\.strip\(\)/g, replacement: '.trim()' },
      { pattern: /\.split\((.*?)\)/g, replacement: '.split($1)' },
    ],

    // Comments
    comments: [{ pattern: /#\s*(.*)$/gm, replacement: '// $1' }],
  };

/**
 * Convert Python code to JavaScript
 * Note: This is a basic converter for simple code. Complex code may need manual adjustment.
 */
export function convertPythonToJavaScript(pythonCode: string): string {
  let jsCode = pythonCode;

  // Apply all conversion patterns
  for (const category of Object.values(CONVERSION_PATTERNS)) {
    for (const { pattern, replacement } of category) {
      jsCode = jsCode.replace(pattern, replacement);
    }
  }

  // Add closing braces for blocks
  // This is a simplified approach - real implementation would need proper parsing
  const lines = jsCode.split('\n');
  const processedLines: string[] = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.endsWith('{')) {
      processedLines.push(line);
      indentLevel++;
    } else if (trimmed === '' || trimmed.startsWith('//')) {
      // Check if we need to close blocks
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.trim() && !nextLine.startsWith('  ') && indentLevel > 0) {
        processedLines.push('  '.repeat(indentLevel - 1) + '}');
        indentLevel--;
      }
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }

  // Close any remaining blocks
  while (indentLevel > 0) {
    processedLines.push('  '.repeat(indentLevel - 1) + '}');
    indentLevel--;
  }

  return processedLines.join('\n');
}

/**
 * Convert Python hints to JavaScript hints
 */
export function convertHintsToJavaScript(pythonHints: string[]): string[] {
  const hintConversions: Record<string, string> = {
    'print()': 'console.log()',
    'input()': 'prompt()',
    'def ': 'function ',
    'True/False': 'true/false',
    indentation: 'braces {}',
    ':': '{',
  };

  return pythonHints.map((hint) => {
    let jsHint = hint;
    for (const [pythonTerm, jsTerm] of Object.entries(hintConversions)) {
      jsHint = jsHint.replace(new RegExp(pythonTerm, 'g'), jsTerm);
    }
    return jsHint;
  });
}

/**
 * Convert a Python-only lesson step to dual-language format
 */
export function convertStepToDualLanguage(step: any): LessonStep {
  const pythonImplementation: LanguageCodeContent = {
    language: 'python',
    initialCode: step.initialCode || '',
    solution: step.solution || '',
    hints: step.hints || [],
  };

  const javascriptImplementation: LanguageCodeContent = {
    language: 'javascript',
    initialCode: convertPythonToJavaScript(pythonImplementation.initialCode),
    solution: convertPythonToJavaScript(pythonImplementation.solution),
    hints: convertHintsToJavaScript(pythonImplementation.hints),
  };

  return {
    id: step.id,
    title: step.title,
    description: step.description,
    implementations: {
      python: pythonImplementation,
      javascript: javascriptImplementation,
    },
    tests: step.tests || [],
  };
}

/**
 * Convert an entire Python-only lesson to dual-language format
 */
export function convertLessonToDualLanguage(oldLesson: any): Lesson {
  return {
    ...oldLesson,
    supportedLanguages: ['python', 'javascript'],
    previewCode: {
      python: oldLesson.previewCode,
      javascript: convertPythonToJavaScript(oldLesson.previewCode),
    },
    content: {
      introduction: oldLesson.content.introduction,
      steps: oldLesson.content.steps.map(convertStepToDualLanguage),
    },
  };
}
