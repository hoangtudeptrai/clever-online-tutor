export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  user_name: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
  profile_picture_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  gender?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student extends User {
  averageGrade: number;
  status: string;
  totalAssignments: number;
  completedAssignments: number;
  totalCourses: number;
  completedCourses: number;
  totalDocuments: number;
  completedDocuments: number;
  totalQuizzes: number;
  completedQuizzes: number;
  totalExams: number;
  lastActivity: string;
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