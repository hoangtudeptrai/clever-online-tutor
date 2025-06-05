
import { useState } from 'react';
import { Menu, X, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">EduManage</h1>
              <p className="text-xs text-gray-600">ĐHGTVT - CNTT</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">
              Trang chủ
            </a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tính năng
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
              Giới thiệu
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Liên hệ
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Đăng nhập
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
              Đăng ký
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">
                Trang chủ
              </a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Tính năng
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">
                Giới thiệu
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Liên hệ
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Đăng nhập
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                  Đăng ký
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
