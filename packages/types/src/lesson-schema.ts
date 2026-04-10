/**
 * Dual-language lesson schema
 * Supports both Python and JavaScript/TypeScript lessons
 */

import { z } from 'zod';
import type { Language } from './index.js';

/**
 * Language-specific code content
 */
export const LanguageCodeContentSchema = z.object({
  language: z.enum(['python', 'javascript', 'typescript']),
  initialCode: z.string(),
  solution: z.string(),
  hints: z.array(z.string()),
});

export type LanguageCodeContent = z.infer<typeof LanguageCodeContentSchema>;

/**
 * Test rule schemas for validating student code
 */
export const ASTRuleSchema = z.object({
  requiredFunctions: z.array(z.string()).optional(),
  requiredConstructs: z
    .array(
      z.object({
        type: z.string(),
        name: z.string().optional(),
        minCount: z.number().optional(),
        maxCount: z.number().optional(),
      }),
    )
    .optional(),
  forbiddenConstructs: z.array(z.string()).optional(),
});

export const RuntimeRuleSchema = z.object({
  outputContains: z.array(z.string()).optional(),
  outputMatches: z.string().optional(),
  noErrors: z.boolean().optional(),
  executionTime: z.number().optional(),
});

export const TestSchema = z.object({
  mode: z.enum(['rules', 'output', 'custom']),
  expectedOutput: z.string().optional(),
  description: z.string(),
  astRules: ASTRuleSchema.optional(),
  runtimeRules: RuntimeRuleSchema.optional(),
});

export type Test = z.infer<typeof TestSchema>;

/**
 * Lesson step - supports multiple languages
 */
export const LessonStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  /**
   * Language-specific implementations
   * At least one language must be provided
   */
  implementations: z.record(
    z.enum(['python', 'javascript', 'typescript']),
    LanguageCodeContentSchema,
  ),
  /**
   * Tests can be language-specific or shared
   */
  tests: z.array(TestSchema),
  /**
   * Optional 3D visualization config
   */
  visualization: z
    .object({
      type: z.enum(['babylon', 'none']),
      sceneConfig: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export type LessonStep = z.infer<typeof LessonStepSchema>;

/**
 * Complete lesson definition
 */
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  intro: z.string(),
  learningObjectives: z.array(z.string()),
  goalDescription: z.string(),
  /**
   * Supported languages for this lesson
   */
  supportedLanguages: z.array(z.enum(['python', 'javascript', 'typescript'])),
  /**
   * Preview code for each language
   */
  previewCode: z.record(
    z.enum(['python', 'javascript', 'typescript']),
    z.string(),
  ),
  content: z.object({
    introduction: z.string(),
    steps: z.array(LessonStepSchema),
  }),
  prerequisites: z.array(z.string()),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estimatedTime: z.number(),
  /**
   * Tags for categorization
   */
  tags: z.array(z.string()).optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;

/**
 * User progress tracking
 */
export const UserProgressSchema = z.object({
  userId: z.string(),
  lessonId: z.string(),
  currentStepId: z.string().optional(),
  completedSteps: z.array(z.string()),
  selectedLanguage: z.enum(['python', 'javascript', 'typescript']),
  startedAt: z.string().datetime(),
  lastAccessedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  codeSnapshots: z.record(z.string(), z.string()).optional(),
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

/**
 * Language selector state
 */
export const LanguageSelectorStateSchema = z.object({
  currentLanguage: z.enum(['python', 'javascript', 'typescript']),
  availableLanguages: z.array(z.enum(['python', 'javascript', 'typescript'])),
});

export type LanguageSelectorState = z.infer<typeof LanguageSelectorStateSchema>;
