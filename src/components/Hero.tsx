
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                🎓 Nền tảng học tập hiện đại
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Hệ thống quản lý
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {" "}học tập trực tuyến
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Nền tảng toàn diện dành cho giáo viên và học sinh, hỗ trợ quản lý khóa học, 
                tài liệu, bài tập và theo dõi tiến độ học tập một cách hiệu quả.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-lg px-8"
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8"
              >
                Tìm hiểu thêm
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Quản lý khóa học</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Tương tác học sinh</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Theo dõi tiến độ</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-2 bg-gray-100 rounded w-16 mt-1"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-blue-600 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-80"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-pink-400 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
