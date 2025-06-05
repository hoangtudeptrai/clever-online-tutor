
import { CheckCircle } from 'lucide-react';

const About = () => {
  const objectives = [
    'Xây dựng một nền tảng học tập trực tuyến hiệu quả',
    'Tăng cường tính tương tác và quản lý',
    'Đảm bảo tính ứng dụng thực tế',
    'Phát triển kỹ năng công nghệ',
    'Đáp ứng yêu cầu bảo mật và hiệu suất'
  ];

  const technologies = [
    'ReactJS - Frontend framework hiện đại',
    'Go - Backend language mạnh mẽ',
    'PostgreSQL - Cơ sở dữ liệu tin cậy',
    'RESTful API - Giao tiếp hiệu quả',
    'JWT Authentication - Bảo mật cao'
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Giới thiệu đề tài
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Hệ thống quản lý học tập trực tuyến (Learning Management System - LMS) là một nền tảng 
                website hỗ trợ quá trình giảng dạy và học tập trực tuyến. Hệ thống bao gồm hai phần chính: 
                website dành cho học sinh và giao diện quản lý dành cho giáo viên.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Website cung cấp một giao diện thân thiện, dễ sử dụng để học sinh truy cập tài liệu, 
                làm bài tập và theo dõi tiến độ học tập. Học sinh có thể tải tài liệu hoặc nộp bài 
                trực tuyến thông qua hệ thống.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Mục tiêu đề tài
              </h3>
              <div className="space-y-3">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Công nghệ sử dụng
              </h3>
              <div className="space-y-4">
                {technologies.map((tech, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-gray-700">{tech}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white p-8 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Thông tin dự án</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-300">Trường:</p>
                  <p className="font-medium">Đại học Giao thông Vận tải</p>
                </div>
                <div>
                  <p className="text-gray-300">Khoa:</p>
                  <p className="font-medium">Công nghệ Thông tin</p>
                </div>
                <div>
                  <p className="text-gray-300">Địa chỉ áp dụng:</p>
                  <p className="font-medium">Dành cho gia sư quản lý học sinh</p>
                </div>
                <div>
                  <p className="text-gray-300">Ngày:</p>
                  <p className="font-medium">Hà Nội, ngày 6 tháng 04 năm 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
