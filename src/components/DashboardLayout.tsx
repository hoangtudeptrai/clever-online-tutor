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
  ClipboardList,
  MessageCircle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import NotificationDropdown from '@/components/NotificationDropdown';
import MessagesDropdown from '@/components/MessagesDropdown';
import AvatarUpload from '@/components/AvatarUpload';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: unreadCounts } = useUnreadCounts();

  const teacherMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: BookOpen, label: 'Quản lý khóa học', path: '/dashboard/courses' },
    { icon: FileText, label: 'Quản lý tài liệu', path: '/dashboard/documents' },
    { icon: ClipboardList, label: 'Quản lý bài tập', path: '/dashboard/assignments' },
    { icon: Users, label: 'Quản lý học sinh', path: '/dashboard/students' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/dashboard/messages' },
    { icon: Award, label: 'Thống kê & báo cáo', path: '/dashboard/reports' },
    { icon: Bell, label: 'Thông báo', path: '/dashboard/notifications' },
    { icon: User, label: 'Hồ sơ cá nhân', path: '/dashboard/profile' },
    { icon: Settings, label: 'Cài đặt', path: '/dashboard/settings' },
  ];

  const studentMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: BookOpen, label: 'Khóa học của tôi', path: '/dashboard/my-courses' },
    { icon: ClipboardList, label: 'Bài tập', path: '/dashboard/assignments' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/dashboard/messages' },
    { icon: Award, label: 'Điểm số', path: '/dashboard/grades' },
    { icon: Bell, label: 'Thông báo', path: '/dashboard/notifications' },
    { icon: User, label: 'Hồ sơ cá nhân', path: '/dashboard/profile' },
  ];

  const adminMenuItems = [
    { icon: Home, label: 'Trang chủ', path: '/dashboard' },
    { icon: Shield, label: 'Quản trị hệ thống', path: '/dashboard/admin' },
    { icon: BookOpen, label: 'Quản lý khóa học', path: '/dashboard/courses' },
    { icon: ClipboardList, label: 'Quản lý bài tập', path: '/dashboard/assignments' },
    { icon: Users, label: 'Quản lý học sinh', path: '/dashboard/students' },
    { icon: MessageCircle, label: 'Tin nhắn', path: '/dashboard/messages' },
    { icon: Bell, label: 'Thông báo', path: '/dashboard/notifications' },
    { icon: User, label: 'Hồ sơ cá nhân', path: '/dashboard/profile' },
    { icon: Settings, label: 'Cài đặt', path: '/dashboard/settings' },
  ];

  const getMenuItems = () => {
    if (profile?.role === 'admin') return adminMenuItems;
    if (profile?.role === 'tutor') return teacherMenuItems;
    return studentMenuItems;
  };

  const menuItems = getMenuItems();

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
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
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
              <Link to="/dashboard" className="flex items-center space-x-3 ml-4 lg:ml-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">EduManage</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">ĐHGTVT - CNTT</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationDropdown unreadCount={unreadCounts?.notifications || 0} />
              <MessagesDropdown unreadCount={unreadCounts?.messages || 0} />
              
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  userName={profile?.full_name || 'User'}
                  size="sm"
                  showUploadButton={false}
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {profile?.full_name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {profile?.role === 'admin' ? 'Quản trị viên' : 
                     profile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}
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
          
          <nav className="mt-6 lg:mt-4 h-full overflow-y-auto pb-20">
            <div className="px-4 mb-6">
              <div className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider">
                {profile?.role === 'admin' ? <Shield className="h-4 w-4" /> :
                 profile?.role === 'tutor' ? <GraduationCap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>
                  {profile?.role === 'admin' ? 'Quản trị viên' :
                   profile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}
                </span>
              </div>
            </div>
            
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActiveRoute(item.path)
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
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
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
