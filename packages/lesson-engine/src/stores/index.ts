import { create } from 'zustand';
import type { Lesson, Language } from '@professor-pixel/types';

interface LessonState {
  currentStep: number;
  code: string;
  language: Language;
  output: string;
  hasError: boolean;
  setStep: (step: number) => void;
  setCode: (code: string) => void;
  setLanguage: (language: Language) => void;
  setOutput: (output: string, hasError: boolean) => void;
  reset: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentStep: 0,
  code: '',
  language: 'python',
  output: '',
  hasError: false,
  setStep: (step) => set({ currentStep: step }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setOutput: (output, hasError) => set({ output, hasError }),
  reset: () => set({ currentStep: 0, code: '', output: '', hasError: false }),
}));
