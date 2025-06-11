
import React, { useState } from 'react';
import { Plus, Upload, X, Image } from 'lucide-react';
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
import { useCreateCourse } from '@/hooks/useCourses';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const CreateCourseDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    thumbnail: null as File | null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const createMutation = useCreateCourse();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();

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
      let thumbnailUrl = '';
      
      // Upload thumbnail nếu có
      if (formData.thumbnail) {
        const uploadResult = await uploadFile(formData.thumbnail, 'course-thumbnails');
        if (uploadResult) {
          thumbnailUrl = uploadResult.url;
        }
      }

      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        thumbnail: thumbnailUrl
      });

      toast({
        title: "Thành công",
        description: "Đã tạo khóa học mới thành công",
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        duration: '',
        thumbnail: null
      });
      setThumbnailPreview(null);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo khóa học",
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
            Tạo một khóa học mới để bắt đầu giảng dạy
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
              <Label htmlFor="description">Mô tả khóa học</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả chi tiết về khóa học"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="duration">Thời lượng</Label>
              <Input
                id="duration"
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
                          onClick={() => document.getElementById('thumbnail-input')?.click()}
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
                          onClick={() => document.getElementById('thumbnail-input')?.click()}
                        >
                          Chọn ảnh đại diện
                        </Button>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP tối đa 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    id="thumbnail-input"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending || uploading}
            >
              {createMutation.isPending || uploading ? 'Đang tạo...' : 'Tạo khóa học'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
