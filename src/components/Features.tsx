
import { BookOpen, Users, Upload, Bell, Settings, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Features = () => {
  const teacherFeatures = [
    {
      icon: BookOpen,
      title: 'Quản lý khóa học',
      description: 'Tạo, chỉnh sửa và quản lý khóa học. Thêm học sinh vào lớp một cách dễ dàng.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Upload,
      title: 'Quản lý tài liệu',
      description: 'Upload và phân loại tài liệu học tập (PDF, video, hình ảnh) theo từng khóa học.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Settings,
      title: 'Quản lý bài tập',
      description: 'Tạo bài tập, đặt hạn nộp và chấm điểm bài làm của học sinh.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Award,
      title: 'Thống kê & báo cáo',
      description: 'Theo dõi tiến độ học tập và điểm số của học sinh qua biểu đồ trực quan.',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Bell,
      title: 'Hệ thống thông báo',
      description: 'Gửi thông báo tự động khi có bài tập mới hoặc cập nhật điểm số.',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Users,
      title: 'Quản lý người dùng',
      description: 'Quản lý tài khoản giáo viên và học sinh với phân quyền rõ ràng.',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const studentFeatures = [
    {
      icon: BookOpen,
      title: 'Truy cập khóa học',
      description: 'Xem danh sách khóa học đã tham gia và truy cập tài liệu học tập.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Upload,
      title: 'Nộp bài tập',
      description: 'Upload file bài làm hoặc nhập câu trả lời trực tiếp trên hệ thống.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Award,
      title: 'Xem điểm số',
      description: 'Theo dõi điểm số và nhận phản hồi từ giáo viên về bài làm.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Users,
      title: 'Hồ sơ cá nhân',
      description: 'Quản lý thông tin cá nhân, ảnh đại diện và cài đặt tài khoản.',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống cung cấp đầy đủ các công cụ cần thiết cho quá trình giảng dạy và học tập trực tuyến hiệu quả.
          </p>
        </div>

        {/* Teacher Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Dành cho Giáo viên
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Features */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Dành cho Học sinh
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
