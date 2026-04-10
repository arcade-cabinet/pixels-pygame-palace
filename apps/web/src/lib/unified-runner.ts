import { type JavaScriptRunner, createJavaScriptRunner } from './javascript/runner';
import { type ExecutionResult, type PythonRunner, createPythonRunner } from './python/runner';

export type Language = 'python' | 'javascript' | 'typescript';

export interface UnifiedRunnerOptions {
  pyodide?: any;
  executeWithEnhancedErrors?: (code: string, context: any) => Promise<ExecutionResult>;
  isEnhancedReady?: boolean;
}

export class UnifiedRunner {
  private pythonRunner: PythonRunner | null = null;
  private javascriptRunner: JavaScriptRunner;

  constructor(options?: UnifiedRunnerOptions) {
    // Initialize JavaScript runner (always available)
    this.javascriptRunner = createJavaScriptRunner();

    // Initialize Python runner if pyodide is available
    if (options?.pyodide) {
      this.pythonRunner = createPythonRunner(options.pyodide, {
        executeWithEnhancedErrors: options.executeWithEnhancedErrors,
        isEnhancedReady: options.isEnhancedReady,
      });
    }
  }

  async runSnippet({
    code,
    input,
    language = 'python',
  }: {
    code: string;
    input?: string;
    language?: Language;
  }): Promise<{ output: string; error: string }> {
    // Normalize language
    const lang = this.normalizeLanguage(language);

    if (lang === 'python') {
      if (!this.pythonRunner) {
        return {
          output: '',
          error: 'Python runtime is not initialized. Pyodide is required for Python execution.',
        };
      }
      return this.pythonRunner.runSnippet({ code, input });
    } else {
      // JavaScript or TypeScript (treat TypeScript as JavaScript for now)
      return this.javascriptRunner.runSnippet({ code, input });
    }
  }

  async runProject({
    files,
    main,
    input,
    language = 'python',
  }: {
    files: Record<string, string>;
    main: string;
    input?: string;
    language?: Language;
  }): Promise<ExecutionResult> {
    const lang = this.normalizeLanguage(language);

    if (lang === 'python') {
      if (!this.pythonRunner) {
        return {
          output: '',
          hasError: true,
          error: {
            title: 'Python Runtime Error',
            message: 'Python runtime is not initialized',
            details: 'Pyodide is required for Python execution but is not available',
            traceback: '',
            suggestions: ['Try refreshing the page', 'Check your internet connection'],
          },
        };
      }
      return this.pythonRunner.runProject({ files, main, input });
    } else {
      return this.javascriptRunner.runProject({ files, main, input });
    }
  }

  isPythonAvailable(): boolean {
    return this.pythonRunner !== null;
  }

  isJavaScriptAvailable(): boolean {
    return true; // Always available
  }

  private normalizeLanguage(language: Language): 'python' | 'javascript' {
    // Treat TypeScript as JavaScript for execution
    if (language === 'typescript') return 'javascript';
    return language;
  }
}

export function createUnifiedRunner(options?: UnifiedRunnerOptions): UnifiedRunner {
  return new UnifiedRunner(options);
}
