
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, CheckCircle, Clock, XCircle, Upload, FileText, Download, Trash2, Paperclip, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

interface AssignmentDocument {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  fileType: string;
}

interface SubmissionFile {
  id: number;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileType: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  submittedDate?: string | null;
  status: string;
  grade?: number | null;
  feedback?: string | null;
  documents: AssignmentDocument[];
  submissionFiles?: SubmissionFile[];
  course: string;
}

const AssignmentDetail = () => {
  const { assignmentId } = useParams();
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock assignment data
  const assignment: Assignment = {
    id: parseInt(assignmentId || '1'),
    title: 'Bài tập 2: JavaScript DOM',
    description: 'Tạo một trang web tương tác sử dụng JavaScript để thao tác DOM. Yêu cầu:\n\n1. Tạo một form đăng ký với validation\n2. Hiển thị danh sách người dùng động\n3. Thêm chức năng tìm kiếm và lọc\n4. Sử dụng Local Storage để lưu trữ dữ liệu\n\nHạn nộp: 20/04/2025\nĐịnh dạng file: .html, .css, .js hoặc .zip',
    dueDate: '2025-04-20',
    submittedDate: null,
    status: 'pending',
    grade: null,
    feedback: null,
    course: 'Lập trình Web',
    documents: [
      {
        id: 1,
        title: 'Hướng dẫn JavaScript DOM',
        description: 'Tài liệu hướng dẫn chi tiết về DOM manipulation',
        fileName: 'javascript-dom-guide.pdf',
        fileSize: '2.1 MB',
        uploadedBy: 'ThS. Nguyễn Văn A',
        uploadedAt: '2025-04-01',
        fileType: 'pdf'
      },
      {
        id: 2,
        title: 'Template HTML mẫu',
        description: 'File template HTML để bắt đầu làm bài',
        fileName: 'template.html',
        fileSize: '0.8 MB',
        uploadedBy: 'ThS. Nguyễn Văn A',
        uploadedAt: '2025-04-01',
        fileType: 'html'
      }
    ],
    submissionFiles: []
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate submission process
    setTimeout(() => {
      console.log('Submitting assignment with:', {
        assignmentId,
        text: submissionText,
        files: selectedFiles
      });
      setIsSubmitting(false);
      // Reset form after successful submission
      setSubmissionText('');
      setSelectedFiles([]);
    }, 2000);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'zip':
      case 'rar':
        return <FileText className="h-5 w-5 text-yellow-600" />;
      case 'html':
      case 'css':
      case 'js':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">Đã nộp</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chưa nộp</Badge>;
      case 'late':
        return <Badge className="bg-red-100 text-red-800">Nộp muộn</Badge>;
      case 'graded':
        return <Badge className="bg-blue-100 text-blue-800">Đã chấm điểm</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'graded':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'late':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
  const canSubmit = assignment.status === 'pending' && !isSubmitting;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Link 
            to="/dashboard/assignments"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại danh sách bài tập
          </Link>
        </div>

        {/* Assignment Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(assignment.status)}
                <div>
                  <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-2">
                    <User className="h-4 w-4" />
                    <span>{assignment.course}</span>
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(assignment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Mô tả bài tập</h3>
                <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                  {assignment.description}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Hạn nộp:
                  </span>
                  <span className="font-medium">{assignment.dueDate}</span>
                </div>

                {assignment.submittedDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ngày nộp:</span>
                    <span className="font-medium">{assignment.submittedDate}</span>
                  </div>
                )}

                {assignment.grade !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Điểm:</span>
                    <span className="font-medium text-blue-600">{assignment.grade}/10</span>
                  </div>
                )}

                {assignment.feedback && (
                  <div className="space-y-2">
                    <span className="text-sm text-gray-600">Nhận xét:</span>
                    <div className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      {assignment.feedback}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Paperclip className="h-5 w-5" />
              <span>Tài liệu đính kèm ({assignment.documents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignment.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          {doc.fileName} • {doc.fileSize}
                        </p>
                        <p className="text-xs text-gray-400">{doc.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Không có tài liệu đính kèm</p>
            )}
          </CardContent>
        </Card>

        {/* Submission Section */}
        {!isSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>Nộp bài tập</CardTitle>
              <CardDescription>
                Hãy nộp bài tập của bạn trước hạn: {assignment.dueDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Submission */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú hoặc mô tả bài làm</label>
                <Textarea
                  placeholder="Nhập ghi chú về bài làm của bạn..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={4}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">File đính kèm</label>
                  <div>
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                      accept=".html,.css,.js,.zip,.rar,.pdf,.doc,.docx"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Chọn file
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">File đã chọn:</p>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded border">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.name.split('.').pop() || '')}
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || (submissionText.trim() === '' && selectedFiles.length === 0)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Đang nộp bài...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Nộp bài tập
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submitted Files (if already submitted) */}
        {isSubmitted && assignment.submissionFiles && assignment.submissionFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bài đã nộp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignment.submissionFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.fileType)}
                      <div>
                        <p className="font-medium">{file.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {file.fileSize} • Nộp lúc: {file.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignmentDetail;
