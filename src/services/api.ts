import axios from 'axios';
import { User, VarkQuestion, VarkResult, Question, Answer, TestSession, AuthForm, ApiResponse } from '@/types';

const API_BASE_URL = 'https://n8n.romanstudi0.pp.ua/webhook';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: async (data: AuthForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  },

  login: async (data: Omit<AuthForm, 'role'>): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response = await api.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }
};

// VARK Test APIs
export const varkAPI = {
  getQuestions: async (): Promise<ApiResponse<VarkQuestion[]>> => {
    try {
      const response = await api.get('/vark/questions');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load VARK questions'
      };
    }
  },

  submitResults: async (results: VarkResult): Promise<ApiResponse<{ vark_type: string }>> => {
    try {
      const response = await api.post('/vark/submit', results);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit VARK results'
      };
    }
  }
};

// Adaptive Test APIs
export const testAPI = {
  getNextQuestion: async (sessionId?: string): Promise<ApiResponse<{ question: Question; session: TestSession }>> => {
    try {
      const response = await api.get('/test/next-question', {
        params: { session_id: sessionId }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get next question'
      };
    }
  },

  submitAnswer: async (answer: Answer): Promise<ApiResponse<{ is_correct: boolean; next_difficulty: string }>> => {
    try {
      const response = await api.post('/test/submit-answer', answer);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit answer'
      };
    }
  },

  getResults: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get results'
      };
    }
  }
};