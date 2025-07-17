
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import ChangePasswordForm from '@/components/ChangePasswordForm';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    phone_number: profile?.phone_number || '',
    address: profile?.address || '',
    education: profile?.education || '',
    experience: profile?.experience || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile(formData);
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student':
        return 'Học sinh';
      case 'tutor':
        return 'Giáo viên';
      case 'admin':
        return 'Quản trị viên';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'tutor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-600 mt-2">Quản lý thông tin và cài đặt tài khoản của bạn</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Bảo mật
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Cài đặt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân và avatar của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <AvatarUpload 
                        currentAvatarUrl={profile?.avatar_url}
                        userName={profile?.full_name || 'User'}
                      />
                      <div>
                        <h3 className="font-medium">{profile?.full_name || 'Chưa cập nhật'}</h3>
                        <p className="text-sm text-gray-600">{profile?.email}</p>
                        <Badge className={getRoleColor(profile?.role || 'student')}>
                          {getRoleDisplay(profile?.role || 'student')}
                        </Badge>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Họ và tên</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Số điện thoại</Label>
                          <Input
                            id="phone_number"
                            value={formData.phone_number}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Nhập địa chỉ"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Giới thiệu</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          placeholder="Viết một chút về bản thân..."
                          rows={3}
                        />
                      </div>

                      {profile?.role === 'tutor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="education">Học vấn</Label>
                            <Input
                              id="education"
                              value={formData.education}
                              onChange={(e) => handleInputChange('education', e.target.value)}
                              placeholder="Nhập trình độ học vấn"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="experience">Kinh nghiệm</Label>
                            <Input
                              id="experience"
                              value={formData.experience}
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              placeholder="Nhập kinh nghiệm làm việc"
                            />
                          </div>
                        </div>
                      )}

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <ChangePasswordForm />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt tài khoản</CardTitle>
                  <CardDescription>
                    Quản lý các tùy chọn và cài đặt tài khoản
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Thông báo email</h4>
                        <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Bật
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Thông báo push</h4>
                        <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Tắt
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
