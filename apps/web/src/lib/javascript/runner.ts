export interface ExecutionContext {
  code: string;
  fileName: string;
  isEducational: boolean;
  files?: { [path: string]: string };
}

export interface ExecutionResult {
  output: string;
  hasError: boolean;
  error?: {
    title: string;
    message: string;
    details: string;
    traceback: string;
    suggestions: string[];
  };
}

export class JavaScriptRunner {
  private consoleOutput: string[] = [];
  private originalConsole: Console;

  constructor() {
    this.originalConsole = window.console;
  }

  async runSnippet({
    code,
    input,
  }: { code: string; input?: string }): Promise<{ output: string; error: string }> {
    this.consoleOutput = [];

    try {
      // Setup console capture
      this.setupConsoleCapture();

      // Create a sandbox function with common globals
      const sandbox = this.createSandbox(input);

      // Execute the code in the sandbox
      const fn = new Function(...Object.keys(sandbox), code);
      const result = fn(...Object.values(sandbox));

      // If the code returns a value, add it to output
      if (result !== undefined) {
        this.consoleOutput.push(String(result));
      }

      // Restore console
      this.restoreConsole();

      const output = this.consoleOutput.join('\n');
      return { output: output || 'Code executed successfully!', error: '' };
    } catch (error) {
      this.restoreConsole();
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : '';
      return {
        output: '',
        error: `${errorMessage}${stack ? `\n\n${stack}` : ''}`,
      };
    }
  }

  async runProject({
    files,
    main,
    input,
  }: {
    files: Record<string, string>;
    main: string;
    input?: string;
  }): Promise<ExecutionResult> {
    this.consoleOutput = [];

    try {
      const mainCode = files[main];
      if (!mainCode) {
        throw new Error(`Main file '${main}' not found in project files`);
      }

      // Setup console capture
      this.setupConsoleCapture();

      // Add require/import simulation for multi-file projects
      const modules: Record<string, any> = {};
      const requireFn = (modulePath: string) => {
        if (modules[modulePath]) return modules[modulePath];

        const moduleCode = files[modulePath] || files[`${modulePath}.js`];
        if (!moduleCode) {
          throw new Error(`Module '${modulePath}' not found`);
        }

        const moduleExports = {};
        const moduleObj = { exports: moduleExports };
        const moduleFn = new Function('exports', 'module', 'require', moduleCode);
        moduleFn(moduleExports, moduleObj, requireFn);

        modules[modulePath] = moduleObj.exports;
        return moduleObj.exports;
      };

      // Create sandbox with require support
      const sandbox = this.createSandbox(input, true);
      sandbox.require = requireFn as any;

      // Execute main file
      const fn = new Function(...Object.keys(sandbox), mainCode);
      const result = fn(...Object.values(sandbox));

      if (result !== undefined) {
        this.consoleOutput.push(String(result));
      }

      this.restoreConsole();

      const output = this.consoleOutput.join('\n');
      return {
        output: output || 'Code executed successfully!',
        hasError: false,
      };
    } catch (error) {
      this.restoreConsole();
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : '';

      return {
        output: '',
        hasError: true,
        error: {
          title: 'Execution Error',
          message: errorMessage,
          details: errorMessage,
          traceback: stack || errorMessage,
          suggestions: this.generateErrorSuggestions(errorMessage),
        },
      };
    }
  }

  private createSandbox(input?: string, includeRequire = false) {
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          this.consoleOutput.push(args.map((arg) => String(arg)).join(' '));
        },
        error: (...args: any[]) => {
          this.consoleOutput.push(`ERROR: ${args.map((arg) => String(arg)).join(' ')}`);
        },
        warn: (...args: any[]) => {
          this.consoleOutput.push(`WARNING: ${args.map((arg) => String(arg)).join(' ')}`);
        },
        info: (...args: any[]) => {
          this.consoleOutput.push(args.map((arg) => String(arg)).join(' '));
        },
      },
      // Add input values if provided (for interactive programs)
      input: input ? input.split('\n') : [],
      prompt: (message?: string) => {
        if (message) this.consoleOutput.push(message);
        const inputLines = input ? input.split('\n') : [];
        return inputLines.shift() || '';
      },
      // Safe setTimeout/setInterval that won't actually run async
      setTimeout: () => {
        throw new Error('setTimeout is not supported in educational code sandbox');
      },
      setInterval: () => {
        throw new Error('setInterval is not supported in educational code sandbox');
      },
      // Provide common JavaScript globals
      Math: Math,
      Date: Date,
      JSON: JSON,
      Array: Array,
      Object: Object,
      String: String,
      Number: Number,
      Boolean: Boolean,
      // Optional require function (added for multi-file projects)
      ...(includeRequire ? { require: () => ({}) as any } : {}),
    };

    return sandbox;
  }

  private setupConsoleCapture() {
    (window as any).console = {
      log: (...args: any[]) => {
        this.consoleOutput.push(args.map((arg) => String(arg)).join(' '));
      },
      error: (...args: any[]) => {
        this.consoleOutput.push(`ERROR: ${args.map((arg) => String(arg)).join(' ')}`);
      },
      warn: (...args: any[]) => {
        this.consoleOutput.push(`WARNING: ${args.map((arg) => String(arg)).join(' ')}`);
      },
      info: (...args: any[]) => {
        this.consoleOutput.push(args.map((arg) => String(arg)).join(' '));
      },
    };
  }

  private restoreConsole() {
    window.console = this.originalConsole;
  }

  private generateErrorSuggestions(errorMessage: string): string[] {
    const suggestions: string[] = [];

    if (errorMessage.includes('is not defined')) {
      suggestions.push('Check if all variables are declared before use');
      suggestions.push('Make sure function names are spelled correctly');
    }

    if (errorMessage.includes('Unexpected token')) {
      suggestions.push('Check for missing or extra brackets, parentheses, or braces');
      suggestions.push('Verify syntax is correct');
    }

    if (errorMessage.includes('Cannot read property')) {
      suggestions.push('Check if the object exists before accessing its properties');
      suggestions.push('Use optional chaining (?.) to safely access properties');
    }

    if (errorMessage.includes('is not a function')) {
      suggestions.push('Verify the variable is actually a function');
      suggestions.push('Check for typos in the function name');
    }

    return suggestions;
  }
}

export function createJavaScriptRunner(): JavaScriptRunner {
  return new JavaScriptRunner();
}
