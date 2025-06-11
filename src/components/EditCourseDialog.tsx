
import React, { useState, useEffect } from 'react';
import { Loader2, Upload, X, Image } from 'lucide-react';
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
import { useUpdateCourse } from '@/hooks/useCourses';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface EditCourseDialogProps {
  course: {
    id: string;
    title: string;
    description?: string;
    duration?: string;
    thumbnail?: string;
    students_count: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCourseDialog: React.FC<EditCourseDialogProps> = ({ course, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || '',
    duration: course.duration || '',
    thumbnail: null as File | null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(course.thumbnail || null);

  const updateMutation = useUpdateCourse();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      title: course.title,
      description: course.description || '',
      duration: course.duration || '',
      thumbnail: null
    });
    setThumbnailPreview(course.thumbnail || null);
  }, [course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên khóa học",
        variant: "destructive",
      });
      return;
    }

    try {
      let thumbnailUrl = course.thumbnail || '';
      
      // Upload thumbnail mới nếu có
      if (formData.thumbnail) {
        const uploadResult = await uploadFile(formData.thumbnail, 'course-thumbnails');
        if (uploadResult) {
          thumbnailUrl = uploadResult.url;
        }
      }

      await updateMutation.mutateAsync({
        courseId: course.id,
        updates: {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          thumbnail: thumbnailUrl
        }
      });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật khóa học thành công",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khóa học",
        variant: "destructive",
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Lỗi",
          description: "File ảnh không được vượt quá 10MB",
          variant: "destructive",
        });
        return;
      }

      setFormData({ ...formData, thumbnail: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setFormData({ ...formData, thumbnail: null });
    setThumbnailPreview(null);
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
              <Label htmlFor="edit-description">Mô tả khóa học</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về khóa học"
                className="min-h-[100px]"
              />
            </div>

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
              <Label>Ảnh đại diện khóa học</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  {thumbnailPreview ? (
                    <div className="text-center">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="max-w-full max-h-48 mx-auto rounded-lg mb-4"
                      />
                      <div className="flex justify-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('edit-thumbnail-input')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Thay đổi ảnh
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeThumbnail}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Xóa ảnh
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('edit-thumbnail-input')?.click()}
                        >
                          Chọn ảnh đại diện
                        </Button>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP tối đa 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="edit-thumbnail-input"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
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
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateMutation.isPending || uploading}
            >
              {updateMutation.isPending || uploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cập nhật khóa học
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseDialog;
