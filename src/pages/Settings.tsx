
import React, { useState } from 'react';
import { Save, Bell, Shield, User, Globe, Palette, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DashboardLayout from '@/components/DashboardLayout';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    assignmentReminders: true,
    gradeNotifications: true,
    courseUpdates: true,
    
    // Privacy Settings
    profileVisibility: 'students',
    showEmail: false,
    showPhone: false,
    
    // Appearance Settings
    theme: 'light',
    language: 'vi',
    dateFormat: 'dd/mm/yyyy',
    
    // Learning Settings
    autoSave: true,
    showProgress: true,
    compactView: false
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would save settings to backend
    console.log('Saving settings:', settings);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-gray-600 mt-2">
              Tùy chỉnh trải nghiệm sử dụng của bạn
            </p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Lưu thay đổi
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Thông báo</CardTitle>
              </div>
              <CardDescription>
                Quản lý cách bạn nhận thông báo từ hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Thông báo qua email</Label>
                  <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Thông báo đẩy</Label>
                  <p className="text-sm text-gray-500">Nhận thông báo trên trình duyệt</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="assignment-reminders">Nhắc nhở bài tập</Label>
                  <p className="text-sm text-gray-500">Thông báo hạn nộp bài tập</p>
                </div>
                <Switch
                  id="assignment-reminders"
                  checked={settings.assignmentReminders}
                  onCheckedChange={(checked) => handleSettingChange('assignmentReminders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="grade-notifications">Thông báo điểm số</Label>
                  <p className="text-sm text-gray-500">Khi có điểm mới</p>
                </div>
                <Switch
                  id="grade-notifications"
                  checked={settings.gradeNotifications}
                  onCheckedChange={(checked) => handleSettingChange('gradeNotifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="course-updates">Cập nhật khóa học</Label>
                  <p className="text-sm text-gray-500">Thông báo về nội dung mới</p>
                </div>
                <Switch
                  id="course-updates"
                  checked={settings.courseUpdates}
                  onCheckedChange={(checked) => handleSettingChange('courseUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Quyền riêng tư</CardTitle>
              </div>
              <CardDescription>
                Kiểm soát thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Hiển thị hồ sơ</Label>
                <Select 
                  value={settings.profileVisibility} 
                  onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Mọi người</SelectItem>
                    <SelectItem value="students">Chỉ học sinh</SelectItem>
                    <SelectItem value="teachers">Chỉ giảng viên</SelectItem>
                    <SelectItem value="none">Không ai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Hiển thị email</Label>
                  <p className="text-sm text-gray-500">Cho phép người khác xem email</p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-phone">Hiển thị số điện thoại</Label>
                  <p className="text-sm text-gray-500">Cho phép người khác xem SĐT</p>
                </div>
                <Switch
                  id="show-phone"
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <CardTitle>Giao diện</CardTitle>
              </div>
              <CardDescription>
                Tùy chỉnh giao diện hiển thị
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Chủ đề</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Sáng</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Tối</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">Tự động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-format">Định dạng ngày</Label>
                <Select 
                  value={settings.dateFormat} 
                  onValueChange={(value) => handleSettingChange('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Learning Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <CardTitle>Học tập</CardTitle>
              </div>
              <CardDescription>
                Cài đặt liên quan đến việc học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Tự động lưu</Label>
                  <p className="text-sm text-gray-500">Tự động lưu bài làm</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-progress">Hiển thị tiến độ</Label>
                  <p className="text-sm text-gray-500">Thanh tiến độ trong bài học</p>
                </div>
                <Switch
                  id="show-progress"
                  checked={settings.showProgress}
                  onCheckedChange={(checked) => handleSettingChange('showProgress', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-view">Giao diện thu gọn</Label>
                  <p className="text-sm text-gray-500">Hiển thị ít thông tin hơn</p>
                </div>
                <Switch
                  id="compact-view"
                  checked={settings.compactView}
                  onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Vùng nguy hiểm</CardTitle>
            <CardDescription>
              Các hành động này không thể hoàn tác
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Đặt lại tất cả cài đặt</p>
                <p className="text-sm text-gray-500">Khôi phục cài đặt mặc định</p>
              </div>
              <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                Đặt lại
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Xóa tài khoản</p>
                <p className="text-sm text-gray-500">Xóa vĩnh viễn tài khoản và dữ liệu</p>
              </div>
              <Button variant="destructive">
                Xóa tài khoản
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
