import axios from 'axios';
import { User, VarkQuestion, VarkResult, Question, Answer, TestSession, AuthForm, ApiResponse, Subject, StudentStats } from '@/types';

const API_BASE_URL = 'https://n8n.romanstudi0.pp.ua/webhook-test';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get user email from localStorage
const getUserEmail = (): string => {
  return localStorage.getItem('user_email') || '';
};

// Helper to set user email
export const setUserEmail = (email: string) => {
  localStorage.setItem('user_email', email);
};

// Helper to parse options from string or array
const parseOptions = (options: any): string[] => {
  if (Array.isArray(options)) {
    return options;
  }
  if (typeof options === 'string') {
    // Try to parse as JSON array first (e.g., "[\"HTTP\",\"FTP\",\"HTTPS\",\"SMTP\"]")
    try {
      const parsed = JSON.parse(options);
      if (Array.isArray(parsed)) {
        return parsed.map(opt => String(opt).trim());
      }
    } catch {
      // If JSON parse fails, parse as comma-separated string (e.g., "\"14\",\"20\", \"10\", \"24\"")
      return options
        .split(',')
        .map(opt => opt.trim().replace(/^["'\[\]]+/, '').replace(/["'\[\]]+$/, ''));
    }
  }
  return [];
};

// Auth APIs
export const authAPI = {
  register: async (data: AuthForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      console.log('API register called with data:', data);
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

  submitResults: async (results: Omit<VarkResult, 'user_id'>): Promise<ApiResponse<{ vark_type: string }>> => {
    try {
      const email = getUserEmail();
      const response = await api.post('/vark/submit', {
        email,
        ...results
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit VARK results'
      };
    }
  },

  getUserResult: async (): Promise<ApiResponse<VarkResult & { vark_type: string }>> => {
    try {
      const email = getUserEmail();
      const response = await api.get('/vark/user-result', {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get VARK result'
      };
    }
  }
};

// Adaptive Test APIs
export const testAPI = {
  getSubjects: async (): Promise<ApiResponse<Subject[]>> => {
    try {
      const response = await api.get('/test/subjects');
      // Handle n8n response format: [{ success: true, data: [{ json: {...} }] }]
      const serverResponse = Array.isArray(response.data) ? response.data[0] : response.data;
      if (serverResponse.success && serverResponse.data) {
        const subjects = serverResponse.data.map((item: any) => ({
          id: item.json.subject_id,
          name: item.json.name,
          description: item.json.description,
          questions_count: item.json.questions_count
        }));
        return { success: true, data: subjects };
      }
      return { success: false, error: 'Invalid response format' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load subjects'
      };
    }
  },

  startTest: async (subjectId: string): Promise<ApiResponse<{ question: Question; session_id: string }>> => {
    try {
      const email = getUserEmail();
      const response = await api.post('/test/start', {
        email,
        subject_id: subjectId
      });
      
      // Handle n8n response format
      const serverResponse = response.data;
      if (serverResponse.success && serverResponse.data) {
        const questionData = serverResponse.data.question;
        const question: Question = {
          id: questionData.id,
          text: questionData.text,
          options: parseOptions(questionData.options),
          correct_answer: questionData.correct_answer || 0,
          difficulty: questionData.difficulty,
          subject: questionData.subject
        };
        return {
          success: true,
          data: {
            session_id: serverResponse.data.session_id,
            question
          }
        };
      }
      return { success: false, error: 'Invalid response format' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to start test'
      };
    }
  },

  submitAnswer: async (sessionId: string, questionId: string, answer: number, timeSpent: number): Promise<ApiResponse<{ is_correct: boolean; next_question?: Question; completed?: boolean }>> => {
    try {
      const email = getUserEmail();
      const response = await api.post('/test/submit-answer', {
        email,
        session_id: sessionId,
        question_id: questionId,
        answer,
        time_spent: timeSpent
      });
      
      // Handle n8n response format
      const serverResponse = response.data;
      if (serverResponse.success && serverResponse.data) {
        const result: { is_correct: boolean; next_question?: Question; completed?: boolean } = {
          is_correct: serverResponse.data.is_correct,
          completed: serverResponse.data.completed
        };
        
        // Parse next question if exists
        if (serverResponse.data.next_question) {
          const nextQuestionData = serverResponse.data.next_question;
          result.next_question = {
            id: nextQuestionData.id,
            text: nextQuestionData.text,
            options: parseOptions(nextQuestionData.options),
            correct_answer: nextQuestionData.correct_answer || 0,
            difficulty: nextQuestionData.difficulty,
            subject: nextQuestionData.subject
          };
        }
        
        return { success: true, data: result };
      }
      return { success: false, error: 'Invalid response format' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit answer'
      };
    }
  },

  getResults: async (): Promise<ApiResponse<any>> => {
    try {
      const email = getUserEmail();
      const response = await api.get('/results', {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get results'
      };
    }
  }
};

// Teacher APIs
export const teacherAPI = {
  createQuestion: async (questionData: {
    text: string;
    options: string[];
    correct_answer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    subject: string;
  }): Promise<ApiResponse<{ id: string }>> => {
    try {
      const response = await api.post('/teacher/questions', questionData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create question'
      };
    }
  },

  updateQuestion: async (questionId: string, questionData: {
    text: string;
    options: string[];
    correct_answer: number;
    difficulty: 'easy' | 'medium' | 'hard';
    subject: string;
  }): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.put(`/teacher/questions/${questionId}`, questionData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update question'
      };
    }
  },

  getQuestions: async (subject?: string): Promise<ApiResponse<Question[]>> => {
    try {
      const response = await api.get('/teacher/questions', {
        params: { subject }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get questions'
      };
    }
  },

  deleteQuestion: async (questionId: string): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.delete(`/teacher/questions/${questionId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete question'
      };
    }
  },

  getStudentsStats: async (): Promise<ApiResponse<StudentStats[]>> => {
    try {
      const response = await api.get('/teacher/students');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get students statistics'
      };
    }
  }
};