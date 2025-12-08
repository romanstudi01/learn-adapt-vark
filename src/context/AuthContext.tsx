import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('auth_token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      localStorage.removeItem('auth_token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, role: 'student' | 'teacher') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        dispatch({ type: 'SET_LOADING', payload: true });
        const result = await authAPI.getProfile();
        if (result.success && result.data) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: result.data, token: state.token },
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    const result = await authAPI.login({ email, password });
    
    if (result.success && result.data) {
      localStorage.setItem('user_email', email);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: result.data.user, token: result.data.token },
      });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const register = async (email: string, password: string, role: 'student' | 'teacher'): Promise<boolean> => {
    console.log('AuthContext register called with role:', role);
    dispatch({ type: 'LOGIN_START' });
    const result = await authAPI.register({ email, password, role });
    
    if (result.success && result.data) {
      localStorage.setItem('user_email', email);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: result.data.user, token: result.data.token },
      });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user_email');
    dispatch({ type: 'LOGOUT' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};