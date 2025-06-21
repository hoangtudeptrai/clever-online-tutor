import React, { useEffect, useState } from 'react';
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
import { User } from '@/types/auth';
import { getApi, postApi, putApi } from '@/utils/api';
import { FILES_API, USERS_API } from '@/components/api-url';
import toast from 'react-hot-toast';
import { formatBirthday } from '@/utils/format';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    bio: user?.bio || '',
    date_of_birth: user?.date_of_birth || new Date().toISOString().split('T')[0],
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

  useEffect(() => {
    if (formData.profile_picture_url) {
      fetchProfilePicture();
    }
  }, [])

  const fetchProfilePicture = async () => {
    try {
      const res = await getApi(FILES_API.GET_FILE(formData.profile_picture_url))
      if (res.data?.url) {
        setFormData({ ...formData, profile_picture_url: res.data.url })
      }
    } catch (error) {
      console.error('Error: ', error)
    }
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!user?.id) throw new Error('User ID not found');

      const uploadData = new FormData();
      uploadData.append('file', file, file.name);

      const res = await postApi(`${FILES_API.UPLOAD(user.id)}`, uploadData);
      if (res?.data?.file_name) {
        setFormData({ ...formData, profile_picture_url: res?.data.file_name });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
    }
  }

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.full_name?.trim()) {
        toast.error('Họ và tên không được để trống');
        return;
      }

      if (!formData.email?.trim()) {
        toast.error('Email không được để trống');
        return;
      }

      // Convert date_of_birth to ISO 8601 format if it exists
      let formattedDateOfBirth = null;
      if (formData.date_of_birth) {
        // Convert YYYY-MM-DD to ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
        const date = new Date(formData.date_of_birth);
        formattedDateOfBirth = date.toISOString();
      }

      // Prepare update data (only include fields that can be updated)
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        profile_picture_url: formData.profile_picture_url,
        address: formData.address,
        bio: formData.bio,
        date_of_birth: formattedDateOfBirth,
      };

      console.log('updateData', updateData);

      // Call API to update user
      const response = await putApi(USERS_API.UPDATE(user?.id), updateData);

      if (response?.data) {
        // Update local user data
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update form data with new values
        setFormData({
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          phone_number: response.data.phone_number || '',
          address: response.data.address || '',
          bio: response.data.bio || '',
          date_of_birth: response.data.date_of_birth,
        });

        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        throw new Error('Không nhận được phản hồi từ server');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);

      if (error.response?.status === 400) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
      } else if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền cập nhật thông tin này.');
      } else if (error.response?.status === 409) {
        toast.error('Email đã được sử dụng bởi tài khoản khác.');
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!');
      }
    }
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
                      <AvatarImage src={formData.profile_picture_url} alt={formData.full_name} />
                      <AvatarFallback className="text-xl">
                        {formData.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                          onClick={() => document.getElementById('avatar')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAvatar}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{formData.full_name}</h3>
                    <p className="text-gray-600">{user?.role === 'teacher' ? 'Giảng viên' : 'Học sinh'}</p>
                    {user?.role === 'student' && (
                      <p className="text-sm text-gray-500">Mã SV: {formData.id}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Họ và tên</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>{formData.full_name}</span>
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
                    <Label htmlFor="phone_number">Số điện thoại</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{formData.phone_number}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Ngày sinh</Label>
                    {isEditing ? (
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formatBirthday(formData.date_of_birth)}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatBirthday(formData.date_of_birth)}</span>
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
            {user?.role === 'student' && (
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
                            className={`h-2 rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
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
            {user?.role === 'student' && (
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
