import type { ExecutionResult, ExecutionContext } from '@professor-pixel/types';
import { SANDBOX_CONFIG } from '@professor-pixel/config';

// Type definitions for Pyodide
interface PyodideInterface {
  runPython(code: string): unknown;
  runPythonAsync(code: string): Promise<unknown>;
  loadPackagesFromImports(code: string): Promise<void>;
  globals: {
    get(name: string): unknown;
    toJs(): Map<string, unknown>;
  };
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, options?: { encoding: string }): string | Uint8Array;
  };
}

/**
 * Python code execution sandbox using Pyodide
 * Provides isolated Python runtime in the browser
 */
export class PythonSandbox {
  private pyodide: PyodideInterface | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize Pyodide runtime
   * This is called automatically on first execution
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Dynamically import Pyodide
        const { loadPyodide } = await import('pyodide');
        this.pyodide = await loadPyodide({
          indexURL: SANDBOX_CONFIG.pyodide.indexURL,
        });

        // Setup stdio redirection
        this.setupStdioRedirection();

        this.initialized = true;
      } catch (error) {
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  /**
   * Setup stdio redirection to capture print() and input()
   */
  private setupStdioRedirection(): void {
    if (!this.pyodide) return;

    this.pyodide.runPython(`
import sys
import io

# Create string buffers for stdout and stderr
_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()

# Redirect stdout and stderr
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

# Store original input function
_original_input = input

# Queue for input values
_input_queue = []

def _mock_input(prompt=''):
    """Mock input function that reads from queue"""
    if prompt:
        print(prompt, end='')
    if _input_queue:
        value = _input_queue.pop(0)
        print(value)  # Echo the input
        return value
    return ''

# Replace built-in input with mock
__builtins__.input = _mock_input

def _get_stdout():
    """Get and clear stdout buffer"""
    value = _stdout_buffer.getvalue()
    _stdout_buffer.truncate(0)
    _stdout_buffer.seek(0)
    return value

def _get_stderr():
    """Get and clear stderr buffer"""
    value = _stderr_buffer.getvalue()
    _stderr_buffer.truncate(0)
    _stderr_buffer.seek(0)
    return value

def _set_input(values):
    """Set input queue with values"""
    global _input_queue
    _input_queue = values if isinstance(values, list) else [values]

def _clear_buffers():
    """Clear all buffers"""
    _stdout_buffer.truncate(0)
    _stdout_buffer.seek(0)
    _stderr_buffer.truncate(0)
    _stderr_buffer.seek(0)
    _input_queue.clear()
`);
  }

  /**
   * Execute Python code with timeout
   */
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pyodide) {
      return {
        output: '',
        hasError: true,
        error: 'Pyodide not initialized',
      };
    }

    const startTime = Date.now();
    const timeout = context.timeout || SANDBOX_CONFIG.timeout;

    try {
      // Clear previous outputs
      this.pyodide.runPython('_clear_buffers()');

      // Setup input if provided
      if (context.input) {
        const inputLines = context.input.split('\n');
        this.pyodide.runPython(
          `_set_input(${JSON.stringify(inputLines)})`,
        );
      }

      // Write files if provided
      if (context.files) {
        for (const [filename, content] of Object.entries(context.files)) {
          this.pyodide.FS.writeFile(filename, content);
        }
      }

      // Execute code with timeout
      const executionPromise = this.pyodide.runPythonAsync(context.code);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout),
      );

      await Promise.race([executionPromise, timeoutPromise]);

      // Get output
      const stdout = this.pyodide.runPython('_get_stdout()') as string;
      const stderr = this.pyodide.runPython('_get_stderr()') as string;

      const output = stdout + (stderr ? '\n' + stderr : '');
      const executionTime = Date.now() - startTime;

      // Get defined variables for debugging
      const globals = this.pyodide.globals.toJs();
      const definedVariables = Array.from(globals.keys()).filter(
        (key) =>
          !key.startsWith('_') &&
          !['sys', 'io', '__builtins__', '__name__', '__doc__'].includes(key),
      );

      return {
        output: output.trim(),
        hasError: false,
        executionTime,
        definedVariables,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Check if timeout
      if (error instanceof Error && error.message === 'Execution timeout') {
        return {
          output: '',
          hasError: true,
          error: `Execution timed out after ${timeout}ms`,
          timedOut: true,
          executionTime,
        };
      }

      // Parse Python error
      const stderr = this.pyodide.runPython('_get_stderr()') as string;
      const stdout = this.pyodide.runPython('_get_stdout()') as string;

      return {
        output: stdout,
        hasError: true,
        error: stderr || (error instanceof Error ? error.message : 'Unknown error'),
        executionTime,
      };
    }
  }

  /**
   * Load Python packages from imports in code
   */
  async loadPackages(code: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pyodide) {
      throw new Error('Pyodide not initialized');
    }

    await this.pyodide.loadPackagesFromImports(code);
  }

  /**
   * Check if Pyodide is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get Pyodide instance (for advanced usage)
   */
  getPyodide(): PyodideInterface | null {
    return this.pyodide;
  }
}
