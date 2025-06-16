
import React, { useState } from 'react';
import { Search, Download, Eye, FileText, Video, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import DocumentActionsMenu from '@/components/DocumentActionsMenu';

const Documents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 1,
      title: 'Giáo trình HTML cơ bản',
      type: 'pdf',
      course: 'Lập trình Web',
      size: '2.5 MB',
      downloads: 245,
      uploadDate: '2025-03-15',
      description: 'Tài liệu hướng dẫn HTML từ cơ bản đến nâng cao',
      category: 'Giáo trình'
    },
    {
      id: 2,
      title: 'Video bài giảng CSS Flexbox',
      type: 'video',
      course: 'Lập trình Web',
      size: '125 MB',
      downloads: 189,
      uploadDate: '2025-03-20',
      description: 'Video hướng dẫn sử dụng CSS Flexbox',
      category: 'Video bài giảng'
    },
    {
      id: 3,
      title: 'Slide bài giảng JavaScript',
      type: 'pptx',
      course: 'Lập trình Web',
      size: '8.2 MB',
      downloads: 167,
      uploadDate: '2025-03-25',
      description: 'Slide trình bày về JavaScript ES6+',
      category: 'Slide'
    },
    {
      id: 4,
      title: 'Hình ảnh minh họa React Components',
      type: 'image',
      course: 'React Nâng cao',
      size: '1.8 MB',
      downloads: 98,
      uploadDate: '2025-04-01',
      description: 'Sơ đồ minh họa cấu trúc React Components',
      category: 'Hình ảnh'
    },
    {
      id: 5,
      title: 'Tài liệu Node.js API',
      type: 'pdf',
      course: 'Node.js Cơ bản',
      size: '4.1 MB',
      downloads: 134,
      uploadDate: '2025-04-05',
      description: 'Hướng dẫn xây dựng API với Node.js và Express',
      category: 'Tài liệu tham khảo'
    },
    {
      id: 6,
      title: 'Code mẫu Database Schema',
      type: 'zip',
      course: 'Database Design',
      size: '856 KB',
      downloads: 67,
      uploadDate: '2025-04-08',
      description: 'File code mẫu thiết kế database schema',
      category: 'Source code'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'video':
      case 'mp4':
      case 'avi':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'image':
      case 'jpg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      video: 'bg-purple-100 text-purple-800',
      image: 'bg-green-100 text-green-800',
      pptx: 'bg-orange-100 text-orange-800',
      zip: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'teacher' ? 'Quản lý tài liệu' : 'Tài liệu học tập'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'teacher' 
                ? 'Tải lên và quản lý tài liệu cho các khóa học'
                : 'Tải xuống tài liệu học tập từ giảng viên'
              }
            </p>
          </div>
          {/* {user?.role === 'teacher' && <CreateDocumentDialog courseId={course?.id} onSuccess={onSuccess} />} */}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-gray-600">Tổng tài liệu</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">1,205</p>
                  <p className="text-sm text-gray-600">Lượt tải</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-gray-600">Video</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">156 MB</p>
                  <p className="text-sm text-gray-600">Dung lượng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.type)}
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.course}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(doc.type)}
                    {user?.role === 'teacher' && (
                      <DocumentActionsMenu document={doc} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{doc.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kích thước:</span>
                    <span className="font-medium">{doc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt tải:</span>
                    <span className="font-medium">{doc.downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tải lên:</span>
                    <span className="font-medium">{doc.uploadDate}</span>
                  </div>
                </div>

                {user?.role === 'student' && (
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
