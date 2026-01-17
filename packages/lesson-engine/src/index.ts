import type { Lesson, Language } from '@professor-pixel/types';
import { PythonSandbox } from '@professor-pixel/python-sandbox';

export class LessonEngine {
  private pythonSandbox: PythonSandbox | null = null;

  constructor() {
    this.pythonSandbox = new PythonSandbox();
  }

  async loadLesson(id: string): Promise<Lesson | null> {
    // TODO: Implement lesson loading from JSON or API
    return null;
  }

  async executeCode(code: string, language: Language) {
    if (language === 'python') {
      if (!this.pythonSandbox) {
        this.pythonSandbox = new PythonSandbox();
      }
      return this.pythonSandbox.execute({ code, language });
    }

    // TODO: Implement JavaScript execution
    return {
      output: 'JavaScript execution not yet implemented',
      hasError: false,
    };
  }
}

export * from './stores/index.js';
