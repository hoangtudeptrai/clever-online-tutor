import { AUTH_API, USERS_API } from '@/components/api-url';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { postApi, getApi } from '../utils/api';

export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'teacher@edumanage.vn',
    name: 'Nguyễn Văn An',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'student@edumanage.vn',
    name: 'Trần Thị Bình',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b589?w=150&h=150&fit=crop&crop=face'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserInfo = async () => {
    try {      
      const response = await getApi(`/users/me?token=${localStorage.getItem('access_token')}`);
      
      if (response?.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      // Nếu có lỗi 401, xóa token và user
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getUserInfo();      
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);      
      const response = await postApi(`${AUTH_API.LOGIN}`, {
        username,
        password
      });

      if (response?.data.token) {
        // Lưu token vào localStorage
        localStorage.setItem('access_token', response.data.token);
        // Lấy thông tin user
        await getUserInfo();
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      avatar: `https://images.unsplash.com/photo-150${Math.floor(Math.random() * 9)}?w=150&h=150&fit=crop&crop=face`
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    window.location.replace('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};