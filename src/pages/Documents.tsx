import React, { useEffect, useState } from 'react';
import { Search, Download, Eye, FileText, Video, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import DocumentActionsMenu from '@/components/DocumentActionsMenu';
import { getApi } from '@/utils/api';
import { COURSE_DOCUMENT_API } from '@/components/api-url';
import { toast } from 'react-hot-toast';
import { Document } from '@/types/document';
import { formatDate } from '@/utils/format';

const Documents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getApi(COURSE_DOCUMENT_API.GET_ALL);
      if (res.data) {
        setDocuments(res.data);
      }
      else {
        setDocuments([]);
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Lỗi khi lấy tài liệu');
    }
  }

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
      'application/pdf': 'bg-red-100 text-red-800',
      'video/mp4': 'bg-purple-100 text-purple-800',
      'image/jpeg': 'bg-green-100 text-green-800',
      'image/png': 'bg-orange-100 text-orange-800',
      'application/zip': 'bg-blue-100 text-blue-800'
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
          {user?.role === 'teacher' && <CreateDocumentDialog courseId={''} onSuccess={fetchDocuments} />}
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
                    {getFileIcon(doc.file_type)}
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription>{doc.course}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeBadge(doc.file_type)}
                    {user?.role === 'teacher' && (
                      <DocumentActionsMenu document={doc} onSuccess={fetchDocuments} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{doc.category || 'Không có'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kích thước:</span>
                    <span className="font-medium">{doc.file_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt tải:</span>
                    <span className="font-medium">{doc.download_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tải lên:</span>
                    <span className="font-medium">{formatDate(doc.createdAt)}</span>
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
