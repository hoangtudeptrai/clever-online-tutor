
import { BookOpen, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EduManage</h3>
                <p className="text-sm text-gray-400">ĐHGTVT - CNTT</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Hệ thống quản lý học tập trực tuyến hiện đại, hỗ trợ quá trình giảng dạy 
              và học tập một cách hiệu quả.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Tính năng</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Quản lý khóa học</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quản lý tài liệu</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bài tập trực tuyến</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Thống kê & báo cáo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ hỗ trợ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Báo lỗi</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">Trường ĐH GTVT, Hà Nội</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <span className="text-gray-400">contact@edumanage.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 EduManage. Trường Đại học Giao thông Vận tải - Khoa Công nghệ Thông tin.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Điều khoản sử dụng
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
