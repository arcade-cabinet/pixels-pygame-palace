import { create } from 'zustand';
import type { User, Lesson, UserProgress } from '@professor-pixel/types';

interface AppState {
  currentUser: User | null;
  currentLesson: Lesson | null;
  progress: UserProgress | null;
  setUser: (user: User | null) => void;
  setLesson: (lesson: Lesson | null) => void;
  setProgress: (progress: UserProgress | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentLesson: null,
  progress: null,
  setUser: (user) => set({ currentUser: user }),
  setLesson: (lesson) => set({ currentLesson: lesson }),
  setProgress: (progress) => set({ progress }),
}));
