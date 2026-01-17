// Re-export all types from schema
export * from './schema.js';

// Execution types for code sandbox
export type Language = 'python' | 'javascript' | 'typescript';

export interface ExecutionContext {
  code: string;
  language: Language;
  fileName?: string;
  isEducational?: boolean;
  files?: Record<string, string>;
  timeout?: number;
  input?: string;
}

export interface ConsoleEntry {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export interface StructuredError {
  title: string;
  message: string;
  details: string;
  traceback: string;
  suggestions: string[];
}

export interface ExecutionResult {
  output: string;
  hasError: boolean;
  error?: StructuredError | string;
  executionTime?: number;
  timedOut?: boolean;
  logs?: ConsoleEntry[];
  definedVariables?: string[];
}
