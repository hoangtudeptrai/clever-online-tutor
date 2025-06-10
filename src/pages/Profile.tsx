import React, { useState } from 'react';
import { Edit, Save, Camera, Mail, Phone, MapPin, Calendar, Award, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

const Profile = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone_number || '0901234567',
    address: profile?.address || 'Hà Nội, Việt Nam',
    bio: profile?.bio || 'Sinh viên ngành Công nghệ thông tin, đam mê lập trình web và mobile.',
    dateOfBirth: '1999-05-15',
    studentId: 'SV001'
  });

  const achievements = [
    { title: 'Hoàn thành khóa học đầu tiên', date: '2025-03-15', icon: '🎓' },
    { title: 'Đạt điểm 9+ trong 5 bài tập liên tiếp', date: '2025-04-01', icon: '⭐' },
    { title: 'Nộp bài đúng hạn 100%', date: '2025-04-10', icon: '⏰' },
    { title: 'Top 3 học sinh xuất sắc tháng', date: '2025-04-12', icon: '🏆' }
  ];

  const enrolledCourses = [
    { name: 'Lập trình Web cơ bản', progress: 85, status: 'active' },
    { name: 'React Nâng cao', progress: 45, status: 'active' },
    { name: 'Node.js Backend', progress: 100, status: 'completed' }
  ];

  const learningStats = {
    totalCourses: 3,
    completedCourses: 1,
    totalAssignments: 25,
    completedAssignments: 21,
    averageGrade: 8.5,
    studyHours: 120
  };

  const handleSave = () => {
    // Here you would typically save to a backend
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
          <Button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Thông tin cá nhân và liên hệ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={formData.name} />
                      <AvatarFallback className="text-xl">
                        {formData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{formData.name}</h3>
                    <p className="text-gray-600">{profile?.role === 'tutor' ? 'Giảng viên' : 'Học sinh'}</p>
                    {profile?.role === 'student' && (
                      <p className="text-sm text-gray-500">Mã SV: {formData.studentId}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{formData.name}</span>
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
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{formData.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formData.dateOfBirth}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{formData.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Giới thiệu bản thân</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700">{formData.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress (Student only) */}
            {profile?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tiến độ học tập</CardTitle>
                  <CardDescription>Các khóa học đang tham gia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrolledCourses.map((course, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{course.name}</span>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={
                                course.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {course.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                            </Badge>
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats (Student only) */}
            {profile?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Thống kê học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khóa học tham gia:</span>
                      <span className="font-medium">{learningStats.totalCourses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khóa học hoàn thành:</span>
                      <span className="font-medium">{learningStats.completedCourses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bài tập đã nộp:</span>
                      <span className="font-medium">
                        {learningStats.completedAssignments}/{learningStats.totalAssignments}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điểm trung bình:</span>
                      <span className="font-medium text-blue-600">{learningStats.averageGrade}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giờ học tích lũy:</span>
                      <span className="font-medium">{learningStats.studyHours}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Thành tích</CardTitle>
                <CardDescription>Các mốc đáng chú ý</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
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
