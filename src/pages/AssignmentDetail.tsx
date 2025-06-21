import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, CheckCircle, Clock, XCircle, Upload, FileText, Download, Trash2, Paperclip, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { getApi, postApi } from '@/utils/api';
import { ASSIGNMENT_DOCUMENTS_API, ASSIGNMENT_SUBMISSION_FILES_API, ASSIGNMENT_SUBMISSIONS_API, ASSIGNMENTS_API, FILES_API, USERS_API } from '@/components/api-url';
import { Assignment, AssignmentDocument, AssignmentSubmission, SubmissionFile } from '@/types/assignment';
import { formatDate } from '@/utils/format';
import { handleDownload } from '@/utils/handleFile';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { user } = useAuth();
  const { assignmentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>(null);
  const [assignmentDocument, setAssignmentDocument] = useState<AssignmentDocument[]>([]);
  const [assignmentSubmission, setAssignmentSubmission] = useState<AssignmentSubmission[]>([]);
  const [submissionFiles, setSubmissionFiles] = useState<SubmissionFile[]>([]);
  const [formData, setFormData] = useState<Partial<AssignmentSubmission>>({
    assignment_id: '',
    content: '',
    feedback: '',
    grade: 10,
    status: 'pending',
    student_id: user?.id,
  });

  useEffect(() => {
    fetchAssignment();
    fetchAssignmentDocAttachments();
    if (user?.role === 'teacher') {
      fetchSubmittedAssignments();
    }
  }, []);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await getApi(ASSIGNMENTS_API.GET_BY_ID(assignmentId));

      if (res.data) {
        const creator = await getApi(USERS_API.GET_BY_ID(res.data.created_by));
        setAssignment({ ...res.data, creator: creator.data.full_name });
      } else {
        setAssignment(null);
      }
    } catch (error) {
      console.log('error', error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDocAttachments = async () => {
    try {
      const res = await getApi(ASSIGNMENT_DOCUMENTS_API.GET_BY_ASSIGNMENT_ID(assignmentId));
      if (res.data.length > 0) {
        setAssignmentDocument(res.data);
      }
      else {
        setAssignmentDocument([]);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  // get list of submitted assignments 
  const fetchSubmittedAssignments = async () => {
    try {
      const res = await getApi(ASSIGNMENT_SUBMISSIONS_API.GET_BY_ASSIGNMENT_ID(assignmentId));
      if (res.data.length > 0) {
        setAssignmentSubmission(res.data);
      }
      else {
        setAssignmentSubmission([]);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    // delete file from selectedFiles by index
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate input
      if (!selectedFiles.length && !formData.content?.trim()) {
        toast.error('Vui lòng nhập nội dung hoặc chọn file để nộp');
        return;
      }

      // Upload files to server
      const filePaths = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await postApi(FILES_API.UPLOAD(user?.id), formData);

            if (res.data) {
              filePaths.push({
                file_path: res.data.file_path,
                file_name: res.data.file_name,
                file_type: res.data.file_type,
                file_size: res.data.file_size,
              });
            }
          } catch (error) {
            console.error('Error uploading file:', file.name, error);
            toast.error(`Lỗi khi upload file: ${file.name}`);
            throw error;
          }
        }
      }

      // Create assignment submission
      const submissionData = {
        assignment_id: assignmentId,
        content: formData.content || '',
        student_id: user?.id,
        status: 'pending',
      };

      const submissionRes = await postApi(ASSIGNMENT_SUBMISSIONS_API.CREATE, submissionData);

      if (!submissionRes.data?.id) {
        throw new Error('Không thể tạo submission');
      }

      // Create assignment submission files
      if (filePaths.length > 0) {
        const submissionFilePromises = filePaths.map(async (filePath) => {
          try {
            await postApi(ASSIGNMENT_SUBMISSION_FILES_API.CREATE, {
              submission_id: submissionRes.data.id,
              file_path: filePath.file_path,
              file_name: filePath.file_name,
              file_type: filePath.file_type,
              file_size: filePath.file_size,
            });
          } catch (error) {
            console.error('Error creating submission file:', error);
            throw error;
          }
        });

        await Promise.all(submissionFilePromises);
      }

      // Success
      toast.success('Nộp bài tập thành công!');

      // Reset form
      setFormData({
        assignment_id: '',
        content: '',
        feedback: '',
        grade: 10,
        status: 'pending',
        student_id: user?.id,
      });
      setSelectedFiles([]);

      // Refresh assignment data
      await fetchAssignment();

    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Có lỗi xảy ra khi nộp bài tập. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
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

  const isSubmitted = assignment?.status === 'submitted' || assignment?.assignment_status === 'graded';
  const canSubmit = assignment?.status === 'pending' && !isSubmitting;

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin bài tập...</p>
            </div>
          </div>
        ) : !assignment ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Không tìm thấy bài tập</p>
          </div>
        ) : (
          <>
            {/* Assignment Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {
                      getStatusIcon(assignment?.status)
                    }
                    <div>
                      <CardTitle className="text-2xl">{assignment?.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-2">
                        <User className="h-4 w-4" />
                        <span>{assignment?.creator}</span>
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(assignment?.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Mô tả bài tập</h3>
                    <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                      {assignment?.content}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Hạn nộp:
                      </span>
                      <span className="font-medium">{formatDate(assignment?.due_date)}</span>
                    </div>

                    {assignment?.submitted && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ngày nộp:</span>
                        <span className="font-medium">{assignment?.submitted}</span>
                      </div>
                    )}

                    {assignment?.max_score !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Điểm:</span>
                        <span className="font-medium text-blue-600">{assignment?.max_score}</span>
                      </div>
                    )}

                    {assignment?.feedback && (
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
                  <span>Tài liệu đính kèm ({assignmentDocument?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignmentDocument?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignmentDocument.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(doc.file_type)}
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-500">
                              {doc.file_name} • {doc.file_size}
                            </p>
                            <p className="text-xs text-gray-400">{doc.file_type}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(doc.file_name)}>
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
            {user?.role === 'student' && (
              <Card>
                <CardHeader>
                  <CardTitle>Nộp bài tập</CardTitle>
                  <CardDescription>
                    Hãy nộp bài tập của bạn trước hạn: {formatDate(assignment?.due_date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit}>
                    {/* Text Submission */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ghi chú hoặc mô tả bài làm</label>
                      <Textarea
                        placeholder="Nhập ghi chú về bài làm của bạn..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                          // disabled={!canSubmit || (submissionText.trim() === '' && selectedFiles.length === 0)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {/* {isSubmitting ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Đang nộp bài...
                            </>
                          ) : (
                           
                          )} */}
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Nộp bài tập
                          </>
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Submitted Files (if already submitted) */}
            {user?.role === 'teacher' && (
              <Card>
                <CardHeader>
                  <CardTitle>Bài đã nộp</CardTitle>
                </CardHeader>
                <CardContent>
                  {submissionFiles?.length > 0 ? (
                    <div className="space-y-3">
                      {submissionFiles?.map((file) => (
                        <div key={file.file_name} className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.file_type)}
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-sm text-gray-500">
                                {file.file_size} • Nộp lúc: {formatDate(file.createdAt)}
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
                  ) : (
                    <p className="text-gray-500 text-center py-8">Chưa có bài tập nào được nộp lên</p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout >
  );
};

export default AssignmentDetail;
