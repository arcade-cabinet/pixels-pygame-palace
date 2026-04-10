import type { Lesson, Language, ExecutionContext, ExecutionResult } from '@professor-pixel/types';
import { PythonSandbox } from '@professor-pixel/python-sandbox';
import { JavaScriptSandbox } from './javascript-sandbox.js';

/**
 * Central lesson engine for managing lessons and code execution
 * Supports both Python and JavaScript execution
 */
export class LessonEngine {
  private pythonSandbox: PythonSandbox;
  private javascriptSandbox: JavaScriptSandbox;

  constructor() {
    this.pythonSandbox = new PythonSandbox();
    this.javascriptSandbox = new JavaScriptSandbox();
  }

  /**
   * Load a lesson by ID
   * TODO: Implement lesson loading from JSON or API
   */
  async loadLesson(id: string): Promise<Lesson | null> {
    // In production, this would fetch from an API or load from JSON
    console.warn('Lesson loading not yet implemented:', id);
    return null;
  }

  /**
   * Execute code in the appropriate sandbox based on language
   */
  async executeCode(context: ExecutionContext): Promise<ExecutionResult> {
    const { code, language } = context;

    switch (language) {
      case 'python':
        return this.pythonSandbox.execute(context);

      case 'javascript':
      case 'typescript':
        // TypeScript is executed as JavaScript (transpilation would happen in editor)
        return this.javascriptSandbox.execute(context);

      default:
        return {
          output: '',
          hasError: true,
          error: `Unsupported language: ${language}`,
        };
    }
  }

  /**
   * Initialize Python sandbox (preload Pyodide)
   * Call this early to reduce first-execution latency
   */
  async initializePython(): Promise<void> {
    await this.pythonSandbox.initialize();
  }

  /**
   * Check if Python sandbox is ready
   */
  isPythonReady(): boolean {
    return this.pythonSandbox.isInitialized();
  }

  /**
   * Get Python sandbox instance (for advanced usage)
   */
  getPythonSandbox(): PythonSandbox {
    return this.pythonSandbox;
  }

  /**
   * Get JavaScript sandbox instance (for advanced usage)
   */
  getJavaScriptSandbox(): JavaScriptSandbox {
    return this.javascriptSandbox;
  }
}

export * from './stores/index.js';
export * from './javascript-sandbox.js';
export * from './lesson-converter.js';
