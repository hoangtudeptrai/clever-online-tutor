import React, { useEffect, useState } from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Assignment, AssignmentDocument } from '@/types/assignment';
import { getApi, postApi, putApi } from '@/utils/api';
import { ASSIGNMENTS_API, COURSES_API, ASSIGNMENT_DOCUMENTS_API, FILES_API } from './api-url';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface EditAssignmentDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSuccess: () => void;
}

const EditAssignmentDialog: React.FC<EditAssignmentDialogProps> = ({ assignment, open, onOpenChange, courseId, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Assignment>>({
    title: assignment.title,
    description: assignment.description,
    course_id: assignment.course_id,
    due_date: assignment.due_date?.split('T')[0], // Format date for input
    max_score: assignment.max_score,
    assignment_status: assignment.assignment_status,
    created_by: assignment.created_by,
    attachments: []
  });

  const [attachmentMetadata, setAttachmentMetadata] = useState<Array<{
    title: string;
    description: string;
    file: File;
  }>>([]);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const response = await getApi(COURSES_API.GET_ALL);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Không thể tải danh sách khóa học');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format the date to include time (end of day for due date)
      const formattedDueDate = formData.due_date
        ? new Date(formData.due_date + 'T23:59:59').toISOString()
        : '';

      // Update the assignment
      const response = await putApi(ASSIGNMENTS_API.UPDATE(assignment.id), {
        ...formData,
        due_date: formattedDueDate
      });
      const updatedAssignment = response.data;

      // Handle file uploads if any
      if (attachmentMetadata.length > 0) {
        const uploadPromises = attachmentMetadata.map(async (metadata) => {
          const uploadData = new FormData();
          uploadData.append('file', metadata.file, metadata.file.name);
          const res = await postApi(FILES_API.UPLOAD(user.id), uploadData);

          if (res?.data) {
            const params = {
              title: metadata.title,
              description: metadata.description,
              assignment_id: updatedAssignment.id,
              file_name: res.data.file_name,
              file_path: res.data.file_path,
              file_type: res.data.file_type,
              file_size: res.data.file_size,
              uploaded_by: user.id
            };

            return postApi(ASSIGNMENT_DOCUMENTS_API.CREATE, params);
          }
        });

        await Promise.all(uploadPromises);
      }

      toast.success('Cập nhật bài tập thành công!');
      onOpenChange(false);
      onSuccess();

      // Reset form
      setFormData({
        title: '',
        description: '',
        course_id: '',
        due_date: '',
        max_score: 10,
        assignment_status: 'active',
        created_by: user?.id,
        attachments: []
      });
      setAttachmentMetadata([]);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bài tập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding new files would exceed the limit
    if (formData.attachments.length + files.length > 2) {
      toast.error('Chỉ được phép upload tối đa 2 file');
      return;
    }

    const newMetadata = files.map(file => ({
      title: '',
      description: '',
      file: file
    }));
    setAttachmentMetadata([...attachmentMetadata, ...newMetadata]);
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
  };

  const updateDocument = (index: number, field: string, value: string) => {
    const newMetadata = [...attachmentMetadata];
    newMetadata[index] = {
      ...newMetadata[index],
      [field]: value
    };
    setAttachmentMetadata(newMetadata);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    const newMetadata = attachmentMetadata.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
    setAttachmentMetadata(newMetadata);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bài tập
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-assignment-title">Tiêu đề bài tập *</Label>
              <Input
                id="edit-assignment-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-assignment-description">Mô tả ngắn *</Label>
              <Input
                id="edit-assignment-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về bài tập"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {!courseId && (
                <div>
                  <Label>Khóa học *</Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="edit-due-date">Hạn nộp *</Label>
                <div className="relative">
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={formData.due_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const localDateTime = e.target.value;
                      setFormData({ ...formData, due_date: localDateTime });
                    }}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-max-grade">Điểm tối đa</Label>
                <Input
                  id="edit-max-grade"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-assignment-content">Mô tả bài tập</Label>
              <Textarea
                id="edit-assignment-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập hướng dẫn chi tiết cho bài tập..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div>
              <Label>File đính kèm mới</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('edit-assignment-files')?.click()}
                        disabled={formData.attachments.length >= 2}
                      >
                        Thêm file đính kèm mới
                      </Button>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, Image, ZIP lên đến 20MB mỗi file (Tối đa 2 file)
                      </p>
                    </div>
                  </div>
                  <input
                    id="edit-assignment-files"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>File mới đã chọn:</Label>
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <Label htmlFor={`document-title-${index}`}>Tiêu đề tài liệu *</Label>
                        <Input
                          id={`document-title-${index}`}
                          value={attachmentMetadata[index]?.title || ''}
                          onChange={(e) => updateDocument(index, 'title', e.target.value)}
                          placeholder="Nhập tiêu đề tài liệu"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`document-description-${index}`}>Mô tả ngắn *</Label>
                        <Input
                          id={`document-description-${index}`}
                          value={attachmentMetadata[index]?.description || ''}
                          onChange={(e) => updateDocument(index, 'description', e.target.value)}
                          placeholder="Mô tả ngắn gọn về tài liệu"
                          required
                        />
                      </div>
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Cập nhật bài tập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentDialog;
