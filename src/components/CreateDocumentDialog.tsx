import React, { useEffect, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
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
import { Document } from '@/types/document';
import { getApi, postApi } from '@/utils/api';
import { COURSE_DOCUMENT_API, COURSES_API, FILES_API } from './api-url';
import { Course } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateDocumentDialogProps {
  courseId: string;
  onSuccess: () => void;
}

const CreateDocumentDialog = ({ onSuccess, courseId }: CreateDocumentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState<Partial<Document>>({
    title: '',
    description: '',
    file_name: '',
    file_path: '',
    file_type: '',
    file_size: 0,
    uploaded_by: '',
  });

  useEffect(() => {
    if (courseId) {
      setFormData({ ...formData, course_id: courseId });
    }
    if (!courseId) {
      fetchCourses();
    }
  }, []);

  const fetchCourses = async (): Promise<Course[]> => {
    try {
      const response = await getApi(COURSES_API.GET_ALL);
      setCourses(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const params = {
      ...formData,
      uploaded_by: user?.id,
    }
    console.log('params', params);

    try {
      const response = await postApi<Document>(COURSE_DOCUMENT_API.CREATE, params);
      if (response.data) {
        toast.success('Tạo tài liệu thành công');
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        file_name: '',
        file_path: '',
        file_type: '',
        file_size: 0,
        uploaded_by: '',
      });
      onSuccess();
    }

  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      const uploadFileData = new FormData();
      uploadFileData.append('file', file);

      const response = await postApi(FILES_API.UPLOAD(user?.id), uploadFileData);
      if (response.status === 200) {
        setFormData({
          ...formData,
          file_name: response.data.file_name,
          file_path: response.data.file_path,
          file_type: response.data.file_type,
          file_size: response.data.file_size,
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Tải lên tài liệu thất bại');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Thêm tài liệu
      </Button>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm tài liệu mới</DialogTitle>
          <DialogDescription>
            Thêm tài liệu mới vào khóa học của bạn. Bạn có thể tải lên các file PDF, Word, Excel, hoặc các file khác.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tên tài liệu *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tên tài liệu"
              required
            />
          </div>

          <div>
            <Label>Mô tả</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả tài liệu"
            />
          </div>

          {(!courseId) && (
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
            <Label>File tài liệu mới (tùy chọn)</Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent className="p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Button type="button" variant="outline" onClick={() => globalThis.document.getElementById('edit-document-file')?.click()}>
                      Chọn file mới
                    </Button>
                    <p className="text-sm text-gray-500">PDF, DOC, PPT, Video, Image lên đến 50MB</p>
                    {formData.file_name && (
                      <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                        <span>{formData.file_name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({
                            ...formData,
                            file_name: '',
                            file_path: '',
                            file_type: '',
                            file_size: 0,
                            uploaded_by: ''
                          })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  id="edit-document-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.jpg,.jpeg,.png,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">Thêm tài liệu</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;
