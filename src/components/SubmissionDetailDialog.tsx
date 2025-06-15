import React, { useState } from 'react';
import { FileText, Download, Calendar, User, Loader2, Image, Archive } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSubmissionFiles, downloadSubmissionFile } from '@/hooks/useSubmissionFiles';
import { useToast } from '@/hooks/use-toast';

interface SubmissionDetailDialogProps {
  submission: any;
  assignment: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubmissionDetailDialog: React.FC<SubmissionDetailDialogProps> = ({
  submission,
  assignment,
  open,
  onOpenChange
}) => {
  const { data: submissionFiles, isLoading: isLoadingFiles } = useSubmissionFiles(submission?.id);
  const { toast } = useToast();
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      graded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      submitted: 'Đã nộp',
      graded: 'Đã chấm',
      pending: 'Chờ nộp'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleDownloadFile = async (file: any) => {
    try {
      setDownloadingFileId(file.id);
      await downloadSubmissionFile(file);
      toast({
        title: "Thành công",
        description: "Đã tải file thành công",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải file",
        variant: "destructive",
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài nộp - {assignment.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Thông tin bài nộp</span>
                {getStatusBadge(submission.grade !== null ? 'graded' : submission.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Học sinh</Label>
                    <p className="text-sm">{submission.student?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ngày nộp</Label>
                    <p className="text-sm">
                      {submission.submitted_at ? formatDate(submission.submitted_at) : 'Chưa nộp'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Content */}
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium text-gray-600">Nội dung bài làm</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {submission.content || 'Không có nội dung'}
                </div>
              </div>

              {/* Grade and Feedback */}
              {submission.grade !== null && (
                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Điểm số</Label>
                      <p className="text-lg font-medium text-green-600">
                        {submission.grade}/{assignment.max_score || 100}
                      </p>
                    </div>
                    {submission.feedback && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nhận xét</Label>
                        <p className="mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Files */}
              {isLoadingFiles ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Đang tải file đính kèm...</span>
                  </div>
                </div>
              ) : submissionFiles && submissionFiles.length > 0 ? (
                <div className="pt-4 border-t">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">File đính kèm ({submissionFiles.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {submissionFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="text-gray-500">
                                {getFileIcon(file.file_type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{file.file_name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(file)}
                              disabled={downloadingFileId === file.id}
                            >
                              {downloadingFileId === file.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Tải xuống
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailDialog;
