import React, { useEffect, useState } from 'react';
import { Plus, Upload, X, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getApi, postApi } from '@/utils/api';
import { ASSIGNMENTS_API, COURSES_API, ASSIGNMENT_DOCUMENTS_API, FILES_API } from './api-url';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface CreateAssignmentDialogProps {
  onSuccess: () => void;
  courseId: string;
}

const CreateAssignmentDialog: React.FC<CreateAssignmentDialogProps> = ({ onSuccess, courseId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);

  const [formData, setFormData] = useState<Partial<Assignment>>({
    title: '',
    description: '',
    course_id: courseId || '',
    due_date: '',
    max_score: 10,
    assignment_status: 'active',
    created_by: user?.id,
    attachments: []
  });

  const [attachmentMetadata, setAttachmentMetadata] = useState<Array<{
    title: string;
    description: string;
    file: File;
  }>>([]);

  useEffect(() => {
    if (!courseId) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const response = await getApi(COURSES_API.GET_ALL);
      console.log('response', response);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  const validateFile = (file: File): boolean => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error(`File ${file.name} vượt quá kích thước cho phép (20MB)`);
      return false;
    }
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Check if adding new files would exceed the limit
    if (formData.attachments.length + files.length > 2) {
      toast.error('Chỉ được phép upload tối đa 2 file');
      return;
    }

    const validFiles = files.filter(validateFile);

    if (validFiles.length !== files.length) {
      return;
    }

    const newMetadata = validFiles.map(file => ({
      title: '',
      description: '',
      file: file
    }));
    setAttachmentMetadata([...attachmentMetadata, ...newMetadata]);
    setFormData({ ...formData, attachments: [...formData.attachments, ...validFiles] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Format the datetime to include timezone
      const formattedDueDate = formData.due_date ? new Date(formData.due_date).toISOString() : '';

      // First create the assignment
      const assignmentData = {
        ...formData,
        due_date: formattedDueDate,
        attachments: [] // We'll add attachments after creating the assignment
      };

      const response = await postApi(ASSIGNMENTS_API.CREATE, assignmentData);
      const assignmentId = response.data.id;

      // Then upload each file with its metadata
      const uploadPromises = attachmentMetadata.map(async (metadata) => {
        const uploadData = new FormData();
        uploadData.append('file', metadata.file, metadata.file.name);
        const res = await postApi(FILES_API.UPLOAD(user.id), uploadData)
        console.log('res', res);
        if (res?.data) {
          const params = {
            title: metadata.title,
            description: metadata.description,
            assignment_id: assignmentId,
            file_name: res.data.file_name,
            file_path: res.data.file_path,
            file_type: res.data.file_type,
            file_size: res.data.file_size,
            uploaded_by: user.id
          }

          return postApi(ASSIGNMENT_DOCUMENTS_API.CREATE, params);
        }

      });

      await Promise.all(uploadPromises);

      toast.success('Tạo bài tập thành công!');
      setOpen(false);
      onSuccess();

      // Reset form
      setFormData({
        title: '',
        description: '',
        course_id: '',
        due_date: '',
        max_score: 10,
        assignment_status: 'active',
        created_by: user?.id || '',
        attachments: []
      });
      setAttachmentMetadata([]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Có lỗi xảy ra khi tạo bài tập. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo bài tập mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo bài tập mới</DialogTitle>
          <DialogDescription>
            Tạo bài tập cho học sinh trong khóa học
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Tiêu đề bài tập *</Label>
              <Input
                id="assignment-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div>
              <Label htmlFor="assignment-description">Mô tả ngắn *</Label>
              <Input
                id="assignment-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về bài tập"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* <div>
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
              </div> */}
              <div>
                <Label htmlFor="due-date">Hạn nộp *</Label>
                <div className="relative">
                  <Input
                    id="due-date"
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
                <Label htmlFor="max-grade">Điểm tối đa</Label>
                <Input
                  id="max-grade"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) })}
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assignment-content">Mô tả bài tập</Label>
              <Textarea
                id="assignment-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập hướng dẫn chi tiết cho bài tập..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div>
              <Label>File đính kèm</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('assignment-files')?.click()}
                        disabled={formData.attachments.length >= 2}
                      >
                        Chọn file đính kèm
                      </Button>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, Image, ZIP lên đến 20MB mỗi file (Tối đa 2 file)
                      </p>
                    </div>
                  </div>
                  <input
                    id="assignment-files"
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
                  <Label>File đã chọn:</Label>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Tạo bài tập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
