import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  InsertLesson,
  InsertProject,
  InsertUser,
  Lesson,
  Project,
  User,
  UserProgress,
} from '@professor-pixel/shared-types';

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getLessons(): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;

  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForLesson(userId: string, lessonId: string): Promise<UserProgress | undefined>;
  updateUserProgress(
    userId: string,
    lessonId: string,
    progress: Partial<UserProgress>,
  ): Promise<UserProgress>;

  listProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Gallery methods
  listPublishedProjects(): Promise<Project[]>;
  publishProject(id: string): Promise<Project>;
  unpublishProject(id: string): Promise<Project>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private lessons: Map<string, Lesson>;
  private userProgress: Map<string, UserProgress>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.lessons = new Map();
    this.userProgress = new Map();
    this.projects = new Map();

    // Initialize with comprehensive fundamentals curriculum
    this.initializeLessons();
  }

  private initializeLessons() {
    try {
      // Load lessons from JSON file
      const lessonsPath = join(process.cwd(), 'public/api/static/lessons.json');
      const lessonsData = readFileSync(lessonsPath, 'utf-8');
      const { lessons } = JSON.parse(lessonsData) as { version: string; lessons: Lesson[] };

      // Add lessons to storage
      lessons.forEach((lesson) => {
        this.lessons.set(lesson.id, lesson);
      });

      console.log(`Loaded ${lessons.length} lessons from ${lessonsPath}`);
    } catch (error) {
      console.error('Failed to load lessons from JSON:', error);
      // Fallback to empty lessons if JSON loading fails
      console.warn('Starting with no lessons loaded');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
    };
    this.users.set(id, user);
    return user;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => a.order - b.order);
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      id,
      title: lessonData.title,
      description: lessonData.description,
      order: lessonData.order,
      content: {
        introduction: lessonData.content.introduction,
        steps: lessonData.content.steps.map((step: any) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          initialCode: step.initialCode,
          solution: step.solution,
          hints: [...step.hints],
          tests: step.tests ? [...step.tests] : undefined,
          validation: step.validation,
        })),
      },
      intro: lessonData.intro || null,
      learningObjectives: lessonData.learningObjectives ? [...lessonData.learningObjectives] : null,
      goalDescription: lessonData.goalDescription || null,
      previewCode: lessonData.previewCode || null,
      prerequisites: lessonData.prerequisites ? [...lessonData.prerequisites] : null,
      difficulty: lessonData.difficulty || null,
      estimatedTime: lessonData.estimatedTime || null,
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const userProgressList: UserProgress[] = [];
    for (const progress of Array.from(this.userProgress.values())) {
      if (progress.userId === userId) {
        userProgressList.push(progress);
      }
    }
    return userProgressList;
  }

  async getUserProgressForLesson(
    userId: string,
    lessonId: string,
  ): Promise<UserProgress | undefined> {
    for (const progress of Array.from(this.userProgress.values())) {
      if (progress.userId === userId && progress.lessonId === lessonId) {
        return progress;
      }
    }
    return undefined;
  }

  async updateUserProgress(
    userId: string,
    lessonId: string,
    progressUpdate: Partial<UserProgress>,
  ): Promise<UserProgress> {
    const existingProgress = await this.getUserProgressForLesson(userId, lessonId);

    if (existingProgress) {
      const updated: UserProgress = {
        ...existingProgress,
        ...progressUpdate,
      };
      this.userProgress.set(existingProgress.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: UserProgress = {
        id,
        userId,
        lessonId,
        currentStep: 0,
        completed: false,
        code: null,
        ...progressUpdate,
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }

  async listProjects(userId: string): Promise<Project[]> {
    const userProjects: Project[] = [];
    for (const project of Array.from(this.projects.values())) {
      if (project.userId === userId) {
        userProjects.push(project);
      }
    }
    return userProjects;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = {
      id,
      userId: projectData.userId,
      name: projectData.name,
      template: projectData.template,
      description: projectData.description || null,
      published: projectData.published || false,
      createdAt: now,
      publishedAt: projectData.published || false ? now : null,
      thumbnailDataUrl: projectData.thumbnailDataUrl || null,
      files: projectData.files ? [...projectData.files] : [],
      assets: projectData.assets
        ? projectData.assets.map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            type: asset.type as 'image' | 'sound' | 'other',
            path: asset.path,
            dataUrl: asset.dataUrl,
          }))
        : [],
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    // Handle publishedAt timestamp automatically when published flag changes
    const publishedChanging = 'published' in updates && existing.published !== updates.published;

    const updated: Project = {
      ...existing,
      ...updates,
    };

    // Automatically manage publishedAt when published state changes
    if (publishedChanging) {
      if (updates.published) {
        // Publishing: set publishedAt to current time
        updated.publishedAt = new Date();
      } else {
        // Unpublishing: clear publishedAt
        updated.publishedAt = null;
      }
    }

    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  // Gallery methods implementation
  async listPublishedProjects(): Promise<Project[]> {
    const publishedProjects: Project[] = [];
    for (const project of Array.from(this.projects.values())) {
      // Include ALL published projects, regardless of publishedAt state
      if (project.published) {
        publishedProjects.push(project);
      }
    }
    // Sort by effective publication date (publishedAt fallback to createdAt), newest first
    return publishedProjects.sort((a, b) => {
      // Use publishedAt if available, otherwise fall back to createdAt, default to 0 for safety
      const effectiveDateA = a.publishedAt
        ? new Date(a.publishedAt).getTime()
        : a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;
      const effectiveDateB = b.publishedAt
        ? new Date(b.publishedAt).getTime()
        : b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;
      return effectiveDateB - effectiveDateA; // Newest first (DESC)
    });
  }

  async publishProject(id: string): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated: Project = {
      ...existing,
      published: true,
      publishedAt: new Date(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async unpublishProject(id: string): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated: Project = {
      ...existing,
      published: false,
      publishedAt: null,
    };
    this.projects.set(id, updated);
    return updated;
  }
}

// Export a singleton storage instance
export const storage = new MemStorage();
