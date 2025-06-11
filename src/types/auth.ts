export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  user_name: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  user_name: string;
  full_name: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, user_name: string, password: string, full_name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
} 