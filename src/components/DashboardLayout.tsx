import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Home, 
  FileText, 
  Users, 
  Award, 
  Settings, 
  Bell,
  LogOut,
  User,
  GraduationCap,
  ClipboardList,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadCounts } from '@/hooks/useUnreadCounts';
import NotificationDropdown from '@/components/NotificationDropdown';
import MessagesDropdown from '@/components/MessagesDropdown';
import AvatarUpload from '@/components/AvatarUpload';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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

  const menuItems = profile?.role === 'tutor' ? teacherMenuItems : studentMenuItems;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <Link to="/dashboard" className="flex items-center space-x-3 lg:ml-0">
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

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar variant="inset" collapsible="icon" className="border-r bg-white">
            <SidebarHeader className="hidden" />
            <SidebarContent className="p-2 pt-4">
              <div className="flex flex-col gap-2">
                <div className="px-2 pb-2 text-xs text-sidebar-foreground/70 flex items-center gap-2">
                  {profile?.role === 'tutor' ? <GraduationCap className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  <span className="group-data-[collapsible=icon]:hidden">{profile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}</span>
                </div>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActiveRoute(item.path)}
                        tooltip={{
                          children: item.label,
                          side: 'right',
                          align: 'center',
                        }}
                      >
                        <Link to={item.path}>
                          <item.icon className="size-4" />
                          <span className="group-data-[collapsible=icon]:hidden truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            </SidebarContent>
          </Sidebar>

          {/* Main content */}
          <SidebarInset>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
