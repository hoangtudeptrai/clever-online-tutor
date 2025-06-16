import React, { useEffect, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
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
import { postApi } from '@/utils/api';
import { COURSES_API, FILES_API } from './api-url';
import { Course } from '@/types/course';
import { toast } from 'sonner';
import { getUser } from '@/utils/getUser';

interface CreateCourseDialogProps {
  onSuccess: () => void;
}

const CreateCourseDialog = ({ onSuccess }: CreateCourseDialogProps) => {
  const [open, setOpen] = useState(false);
  const user = getUser();
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    duration: '',
    lessons_count: 0,
    students_count: 0,
    thumbnail: '',
    instructor_id: user?.id || ''
  });

  const createCourse = async (data: Partial<Course>): Promise<boolean> => {
    try {
      const res = await postApi(`${COURSES_API.CREATE}`, data);
      console.log('res', res);
      return true;
    } catch (error) {
      console.error('Error creating course:', error);
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createCourse(formData);
    if (success) {
      toast.success('Tạo khóa học thành công');
      onSuccess();
    } else {
      toast.error('Tạo khóa học thất bại');
    }
    setOpen(false);
  }
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!user?.id) throw new Error('User ID not found');

      const uploadData = new FormData();
      uploadData.append('file', file, file.name);
      
      const res = await postApi(`${FILES_API.UPLOAD(user.id)}`, uploadData);
      if (res?.data?.file_name) {
        setFormData({ ...formData, thumbnail: res?.data.file_name });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo khóa học mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo khóa học mới cho học sinh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tên khóa học *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tên khóa học"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Mô tả khóa học *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về khóa học"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Thời lượng</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value})}
                  placeholder="VD: 12 tuần"
                />
              </div>
              {/* <div>
                <Label htmlFor="maxStudents">Số học sinh tối đa</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })}
                  placeholder="VD: 30"
                />
              </div> */}
            </div>

            <div>
              <Label>Ảnh thumbnail</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('thumbnail')?.click()}>
                        Chọn ảnh
                      </Button>
                      <p className="text-sm text-gray-500">PNG, JPG lên đến 5MB</p>
                      {formData.thumbnail && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                          <span>{formData.thumbnail}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, thumbnail: '' })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    id="thumbnail"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Tạo khóa học
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
