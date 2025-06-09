
import React, { useState } from 'react';
import { Edit, Upload, X } from 'lucide-react';
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

interface EditCourseDialogProps {
  course: {
    id: number;
    title: string;
    description: string;
    duration: string;
    students: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({ course, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    duration: course.duration,
    maxStudents: course.students.toString(),
    thumbnail: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cập nhật khóa học:', formData);
    // Logic cập nhật khóa học
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin khóa học
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Tên khóa học *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên khóa học"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Mô tả khóa học *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về khóa học"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Thời lượng</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="VD: 12 tuần"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxStudents">Số học sinh tối đa</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  placeholder="VD: 30"
                />
              </div>
            </div>

            <div>
              <Label>Ảnh thumbnail mới</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('edit-thumbnail')?.click()}>
                        Chọn ảnh mới
                      </Button>
                      <p className="text-sm text-gray-500">PNG, JPG lên đến 5MB</p>
                      {formData.thumbnail && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                          <span>{formData.thumbnail.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, thumbnail: null })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/*"
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
              Cập nhật khóa học
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
