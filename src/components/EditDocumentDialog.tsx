
import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
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
import { useCourses } from '@/hooks/useCourses';
import { useUpdateDocument } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';

interface EditDocumentDialogProps {
  document: {
    id: string;
    title: string;
    description: string;
    file_type: string;
    file_name: string;
    file_path: string;
    course_id: string;
    course_title: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_type: '',
    course_id: '',
    file: null as File | null
  });
  
  const { data: courses = [] } = useCourses();
  const updateDocument = useUpdateDocument();
  const { toast } = useToast();

  // Update form data when document changes
  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        description: document.description || '',
        file_type: document.file_type || '',
        course_id: document.course_id || '',
        file: null
      });
    }
  }, [document]);

  const categories = [
    'application/pdf',
    'video/mp4',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-powerpoint',
    'application/zip'
  ];

  const getCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      'application/pdf': 'PDF',
      'video/mp4': 'Video',
      'image/jpeg': 'Hình ảnh',
      'image/png': 'Hình ảnh',
      'application/vnd.ms-powerpoint': 'Slide',
      'application/zip': 'Tài liệu nén'
    };
    return labels[type] || 'Tài liệu';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateDocument.mutateAsync({
        id: document.id,
        documentData: {
          title: formData.title,
          description: formData.description,
          file_type: formData.file_type,
          course_id: formData.course_id,
        }
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa tài liệu</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin tài liệu
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-doc-title">Tên tài liệu *</Label>
              <Input
                id="edit-doc-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên tài liệu"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-doc-description">Mô tả tài liệu *</Label>
              <Textarea
                id="edit-doc-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về tài liệu"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>Loại file *</Label>
                <Select value={formData.file_type} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại file" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryLabel(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>File tài liệu hiện tại</Label>
              <Card className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{document.file_name}</p>
                      <p className="text-xs text-gray-500">File hiện tại</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Label>Thay đổi file (tùy chọn)</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={() => globalThis.document.getElementById('edit-document-file')?.click()}>
                        Chọn file mới
                      </Button>
                      <p className="text-sm text-gray-500">PDF, DOC, PPT, Video, Image lên đến 50MB</p>
                      {formData.file && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                          <span>{formData.file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, file: null })}
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
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateDocument.isPending} className="bg-blue-600 hover:bg-blue-700">
              {updateDocument.isPending ? 'Đang cập nhật...' : 'Cập nhật tài liệu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
