import type { Language } from '@professor-pixel/types';

export const APP_CONFIG = {
  name: 'Professor Pixel\'s Programming Palace',
  version: '1.0.0',
  supportedLanguages: ['python', 'javascript'] as Language[],
} as const;

export const SANDBOX_CONFIG = {
  timeout: 5000,
  maxOutputLength: 10000,
  pyodide: {
    version: '0.26.4',
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
  },
} as const;

export const LESSON_CONFIG = {
  defaultDifficulty: 'Beginner' as const,
  maxHintsPerStep: 3,
  estimatedTimePerLesson: 25, // minutes
} as const;

export const UI_CONFIG = {
  professor: {
    name: 'Professor Pixel',
    expressions: 27, // Total facial expressions available
  },
  theme: {
    primary: '#6366f1', // indigo-500
    secondary: '#8b5cf6', // violet-500  },
} as const;
