
import React, { useState } from 'react';
import { Search, Download, Eye, FileText, Video, Image, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import CreateDocumentDialog from '@/components/CreateDocumentDialog';
import DocumentActionsMenu from '@/components/DocumentActionsMenu';
import { useDocuments, useDownloadDocument } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

const Documents = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: documents = [], isLoading, error } = useDocuments();
  const downloadMutation = useDownloadDocument();
  const { toast } = useToast();

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'jpg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      mp4: 'bg-purple-100 text-purple-800',
      jpg: 'bg-green-100 text-green-800',
      png: 'bg-green-100 text-green-800',
      pptx: 'bg-orange-100 text-orange-800',
      zip: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type?.toUpperCase() || 'FILE'}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleDownload = async (document: any) => {
    downloadMutation.mutate(document);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Có lỗi xảy ra khi tải dữ liệu</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile?.role === 'tutor' ? 'Quản lý tài liệu' : 'Tài liệu học tập'}
            </h1>
            <p className="text-gray-600 mt-2">
              {profile?.role === 'tutor' 
                ? 'Tải lên và quản lý tài liệu cho các khóa học'
                : 'Tải xuống tài liệu học tập từ giảng viên'
              }
            </p>
          </div>
          {profile?.role === 'tutor' && <CreateDocumentDialog />}
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
                  <p className="text-2xl font-bold">{documents.length}</p>
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
                  <p className="text-2xl font-bold">-</p>
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
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.file_type?.includes('video') || d.file_type === 'mp4').length}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {documents.reduce((total, doc) => total + (doc.file_size || 0), 0) / 1024 / 1024 > 1 
                      ? `${Math.round(documents.reduce((total, doc) => total + (doc.file_size || 0), 0) / 1024 / 1024)} MB`
                      : `${Math.round(documents.reduce((total, doc) => total + (doc.file_size || 0), 0) / 1024)} KB`
                    }
                  </p>
                  <p className="text-sm text-gray-600">Dung lượng</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Documents List */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Không tìm thấy tài liệu nào' : 'Chưa có tài liệu nào'}
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.file_type || '')}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{doc.title}</CardTitle>
                          <CardDescription className="truncate">
                            {doc.course?.title || 'Không có khóa học'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(doc.file_type || '')}
                        {profile?.role === 'tutor' && (
                          <DocumentActionsMenu document={doc} />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kích thước:</span>
                        <span className="font-medium">{formatFileSize(doc.file_size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Người tải lên:</span>
                        <span className="font-medium truncate">
                          {doc.uploader?.full_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày tải lên:</span>
                        <span className="font-medium">{formatDate(doc.created_at)}</span>
                      </div>
                    </div>

                    {profile?.role === 'student' && (
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Tải xuống
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;
