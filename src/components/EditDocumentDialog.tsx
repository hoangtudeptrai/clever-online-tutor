
import React, { useState } from 'react';
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

interface EditDocumentDialogProps {
  document: {
    id: number;
    title: string;
    description: string;
    category: string;
    course: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDocumentDialog: React.FC<EditDocumentDialogProps> = ({ document, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description,
    category: document.category,
    course: document.course,
    file: null as File | null
  });

  const courses = [
    'Lập trình Web',
    'React Nâng cao',
    'Node.js Cơ bản',
    'Database Design'
  ];

  const categories = [
    'Giáo trình',
    'Video bài giảng',
    'Slide',
    'Hình ảnh',
    'Tài liệu tham khảo',
    'Source code'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cập nhật tài liệu:', formData);
    // Logic cập nhật tài liệu
    onOpenChange(false);
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
                <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Danh mục *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Cập nhật tài liệu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
