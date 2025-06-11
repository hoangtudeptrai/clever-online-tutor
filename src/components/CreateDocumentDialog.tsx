
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
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
import { useCourses } from '@/hooks/useCourses';
import { useCreateDocument } from '@/hooks/useDocuments';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const CreateDocumentDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    file: null as File | null
  });

  const { profile } = useAuth();
  const { data: courses = [] } = useCourses();
  const createDocumentMutation = useCreateDocument();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();

  // Lọc khóa học của giáo viên hiện tại
  const tutorCourses = profile?.role === 'tutor' 
    ? courses.filter(course => course.instructor_id === profile.id)
    : courses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.course_id || !formData.file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin và chọn file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload file lên storage
      const uploadResult = await uploadFile(formData.file, 'course-documents');
      if (!uploadResult) {
        toast({
          title: "Lỗi",
          description: "Không thể tải file lên",
          variant: "destructive",
        });
        return;
      }

      // Tạo document record trong database
      await createDocumentMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        course_id: formData.course_id,
        file_name: formData.file.name,
        file_path: uploadResult.path,
        file_size: formData.file.size,
        file_type: formData.file.type
      });

      toast({
        title: "Thành công",
        description: "Đã tải lên tài liệu thành công",
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        course_id: '',
        file: null
      });
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo tài liệu",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "Lỗi",
          description: "File không được vượt quá 50MB",
          variant: "destructive",
        });
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Tải lên tài liệu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu mới</DialogTitle>
          <DialogDescription>
            Thêm tài liệu học tập cho khóa học
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-title">Tên tài liệu *</Label>
              <Input
                id="doc-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên tài liệu"
                required
              />
            </div>

            <div>
              <Label htmlFor="doc-description">Mô tả tài liệu</Label>
              <Textarea
                id="doc-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về tài liệu"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Khóa học *</Label>
              <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {tutorCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File tài liệu *</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('document-file')?.click()}>
                        Chọn file
                      </Button>
                      <p className="text-sm text-gray-500">PDF, DOC, PPT, Video, Image lên đến 50MB</p>
                      {formData.file && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600 mt-2">
                          <span>{formData.file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    id="document-file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createDocumentMutation.isPending || uploading}
            >
              {createDocumentMutation.isPending || uploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;
