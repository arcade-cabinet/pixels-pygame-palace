/**
 * JavaScript code execution sandbox
 * Provides isolated JavaScript runtime with console capture
 */

import type { ExecutionResult, ExecutionContext, ConsoleEntry } from '@professor-pixel/types';
import { SANDBOX_CONFIG } from '@professor-pixel/config';

/**
 * JavaScript sandbox for executing student code
 * Captures console output and handles errors safely
 */
export class JavaScriptSandbox {
  /**
   * Execute JavaScript code in an isolated context
   */
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now();
    const consoleLog: ConsoleEntry[] = [];
    const outputs: string[] = [];

    try {
      // Create isolated console object
      const mockConsole = {
        log: (...args: unknown[]) => {
          const message = args.map((arg) => this.formatValue(arg)).join(' ');
          consoleLog.push({ type: 'log', message, timestamp: Date.now() });
          outputs.push(message);
        },
        error: (...args: unknown[]) => {
          const message = args.map((arg) => this.formatValue(arg)).join(' ');
          consoleLog.push({ type: 'error', message, timestamp: Date.now() });
          outputs.push(`ERROR: ${message}`);
        },
        warn: (...args: unknown[]) => {
          const message = args.map((arg) => this.formatValue(arg)).join(' ');
          consoleLog.push({ type: 'warn', message, timestamp: Date.now() });
          outputs.push(`WARNING: ${message}`);
        },
        info: (...args: unknown[]) => {
          const message = args.map((arg) => this.formatValue(arg)).join(' ');
          consoleLog.push({ type: 'info', message, timestamp: Date.now() });
          outputs.push(`INFO: ${message}`);
        },
      };

      // Mock prompt for input() equivalent
      const mockPrompt = (message?: string): string | null => {
        if (message) {
          mockConsole.log(message);
        }
        if (context.input) {
          const lines = context.input.split('\n');
          return lines.shift() || '';
        }
        return null;
      };

      // Create execution context with mocked globals
      const sandbox = {
        console: mockConsole,
        prompt: mockPrompt,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        // Add other safe globals as needed
      };

      // Wrap code in async function to support await
      const wrappedCode = `
        (async function() {
          ${context.code}
        })()
      `;

      // Create function with restricted scope
      const executionFunction = new Function(
        ...Object.keys(sandbox),
        `return ${wrappedCode}`,
      );

      // Execute with timeout
      const timeout = context.timeout || SANDBOX_CONFIG.timeout;
      const executionPromise = executionFunction(...Object.values(sandbox));
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout),
      );

      await Promise.race([executionPromise, timeoutPromise]);

      const executionTime = Date.now() - startTime;

      // Truncate output if too long
      let output = outputs.join('\n');
      if (output.length > SANDBOX_CONFIG.maxOutputLength) {
        output =
          output.substring(0, SANDBOX_CONFIG.maxOutputLength) +
          '\n... (output truncated)';
      }

      return {
        output: output.trim(),
        hasError: false,
        executionTime,
        logs: consoleLog,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Check if timeout
      if (error instanceof Error && error.message === 'Execution timeout') {
        return {
          output: outputs.join('\n'),
          hasError: true,
          error: `Execution timed out after ${context.timeout || SANDBOX_CONFIG.timeout}ms`,
          timedOut: true,
          executionTime,
          logs: consoleLog,
        };
      }

      // Parse JavaScript error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      return {
        output: outputs.join('\n'),
        hasError: true,
        error: {
          title: 'JavaScript Error',
          message: errorMessage,
          details: errorStack || '',
          traceback: errorStack || '',
          suggestions: this.generateErrorSuggestions(errorMessage),
        },
        executionTime,
        logs: consoleLog,
      };
    }
  }

  /**
   * Format a value for console output
   */
  private formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'function') return '[Function]';
    if (Array.isArray(value)) {
      return '[' + value.map((v) => this.formatValue(v)).join(', ') + ']';
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  }

  /**
   * Generate error suggestions based on common mistakes
   */
  private generateErrorSuggestions(errorMessage: string): string[] {
    const suggestions: string[] = [];

    if (errorMessage.includes('is not defined')) {
      suggestions.push('Make sure the variable is declared with let, const, or var');
      suggestions.push('Check for typos in variable names');
    }

    if (errorMessage.includes('unexpected token')) {
      suggestions.push('Check for missing or extra brackets, braces, or parentheses');
      suggestions.push('Make sure all strings are properly quoted');
    }

    if (errorMessage.includes('is not a function')) {
      suggestions.push('Check that you are calling a function, not a variable');
      suggestions.push('Make sure the function is defined before calling it');
    }

    if (errorMessage.includes('Cannot read property')) {
      suggestions.push('Check if the object exists before accessing its properties');
      suggestions.push('Use optional chaining (?.) to safely access nested properties');
    }

    if (suggestions.length === 0) {
      suggestions.push('Read the error message carefully for clues');
      suggestions.push('Check the line number where the error occurred');
    }

    return suggestions;
  }
}
