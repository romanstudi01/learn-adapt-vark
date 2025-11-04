// Types for the educational platform

export interface User {
  id: string;
  email: string;
  role: 'student' | 'teacher';
  vark_type?: VarkType;
  created_at: string;
}

export interface VarkResult {
  user_id?: string;
  visual: number;
  auditory: number;
  read_write: number;
  kinesthetic: number;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  questions_count: number;
}

export interface StudentStats {
  email: string;
  name?: string;
  vark_type?: VarkType;
  tests_completed: number;
  average_score: number;
  last_test_date?: string;
}

export type VarkType = 'visual' | 'auditory' | 'read_write' | 'kinesthetic';

export interface VarkQuestion {
  id: string;
  text: string;
  options: VarkOption[];
}

export interface VarkOption {
  id: string;
  text: string;
  type: VarkType;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

export interface Answer {
  user_id: string;
  question_id: string;
  answer: number;
  time_spent: number;
  is_correct: boolean;
}

export interface TestSession {
  id: string;
  user_id: string;
  current_question?: Question;
  score: number;
  questions_answered: number;
  difficulty_level: number;
  is_completed: boolean;
}

export interface AuthForm {
  email: string;
  password: string;
  role?: 'student' | 'teacher';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}