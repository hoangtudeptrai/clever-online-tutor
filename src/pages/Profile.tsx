
import React, { useState } from 'react';
import { Edit, Save, Mail, Phone, MapPin, User, BookOpen, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import AvatarUpload from '@/components/AvatarUpload';

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone_number: profile?.phone_number || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
    education: profile?.education || '',
    experience: profile?.experience || '',
  });

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
          </div>
          <Button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} shadow-lg`}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Profile Summary Card */}
          <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="text-center">
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  userName={formData.full_name}
                  size="lg"
                  showUploadButton={isEditing}
                />
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{formData.full_name}</h3>
                  <Badge className={
                    profile?.role === 'tutor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }>
                    {profile?.role === 'tutor' ? 'Giảng viên' : 'Học sinh'}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <p>Thành viên từ</p>
                    <p className="font-medium">2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Cards */}
          <div className="xl:col-span-3 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Thông tin cơ bản
                </CardTitle>
                <CardDescription>Thông tin cá nhân và liên hệ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <span>{formData.full_name || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{formData.email || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Số điện thoại</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{formData.phone_number || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{formData.address || 'Chưa cập nhật'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Giới thiệu bản thân</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Hãy giới thiệu về bản thân..."
                      className="w-full"
                    />
                  ) : (
                    <div className="min-h-[100px] p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {formData.bio || 'Chưa có giới thiệu'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education & Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Học vấn & Kinh nghiệm
                </CardTitle>
                <CardDescription>Thông tin về trình độ học vấn và kinh nghiệm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="education">Học vấn</Label>
                  {isEditing ? (
                    <Textarea
                      id="education"
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      rows={3}
                      placeholder="Trình độ học vấn, bằng cấp..."
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md min-h-[80px]">
                      <Award className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-gray-700">{formData.education || 'Chưa cập nhật'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Kinh nghiệm</Label>
                  {isEditing ? (
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      rows={4}
                      placeholder="Kinh nghiệm làm việc, dự án đã tham gia..."
                      className="w-full"
                    />
                  ) : (
                    <div className="min-h-[100px] p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {formData.experience || 'Chưa có thông tin kinh nghiệm'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
