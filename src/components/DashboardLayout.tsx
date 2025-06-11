import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Menu, 
  X, 
  Home, 
  FileText, 
  Upload, 
  Users, 
  Award, 
  Settings, 
  Bell,
  LogOut,
  User,
  GraduationCap,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const teacherMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: BookOpen, label: 'Quản lý khóa học', path: '/dashboard/courses' },
    { icon: FileText, label: 'Quản lý tài liệu', path: '/dashboard/documents' },
    { icon: ClipboardList, label: 'Quản lý bài tập', path: '/dashboard/assignments' },
    { icon: Users, label: 'Quản lý học sinh', path: '/dashboard/students' },
    { icon: Award, label: 'Thống kê & báo cáo', path: '/dashboard/reports' },
    { icon: Bell, label: 'Thông báo', path: '/dashboard/notifications' },
    { icon: Settings, label: 'Cài đặt', path: '/dashboard/settings' },
  ];

  const studentMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: BookOpen, label: 'Khóa học của tôi', path: '/dashboard/my-courses' },
    { icon: ClipboardList, label: 'Bài tập', path: '/dashboard/assignments' },
    { icon: Award, label: 'Điểm số', path: '/dashboard/grades' },
    { icon: Bell, label: 'Thông báo', path: '/dashboard/notifications' },
    { icon: User, label: 'Hồ sơ cá nhân', path: '/dashboard/profile' },
  ];

  const menuItems = profile?.role === 'tutor' ? teacherMenuItems : studentMenuItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Link to="/dashboard" className="flex items-center space-x-2 ml-4 lg:ml-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">EduManage</h1>
                  <p className="text-xs text-gray-600">ĐHGTVT - CNTT</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-600">
                    {profile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <span className="text-lg font-semibold">Menu</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="mt-8 lg:mt-4">
            <div className="px-4 mb-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider">
                {profile?.role === 'tutor' ? <GraduationCap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>{profile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}</span>
              </div>
            </div>
            
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${isActiveRoute(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
