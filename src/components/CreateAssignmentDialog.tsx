import React, { useState } from 'react';
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
import { useCourses } from '@/hooks/useCourses';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CreateAssignmentDialogProps {
  courseId?: string;
}

const CreateAssignmentDialog = ({ courseId }: CreateAssignmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: courseId || '',
    due_date: '',
    max_score: '10',
    instructions: '',
    attachments: [] as File[]
  });

  const { profile } = useAuth();
  const { data: courses = [] } = useCourses();
  const createAssignmentMutation = useCreateAssignment();
  const { uploadFile, uploading } = useFileUpload();
  const { toast } = useToast();

  // Lọc khóa học của giáo viên hiện tại
  const tutorCourses = profile?.role === 'tutor' 
    ? courses.filter(course => course.instructor_id === profile.id)
    : courses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.course_id || !formData.instructions.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine description and instructions into description field
      const combinedDescription = formData.description 
        ? `${formData.description}\n\nHướng dẫn:\n${formData.instructions}`
        : formData.instructions;

      await createAssignmentMutation.mutateAsync({
        title: formData.title,
        description: combinedDescription,
        course_id: formData.course_id,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        max_score: parseInt(formData.max_score),
      });

      toast({
        title: "Thành công",
        description: "Đã tạo bài tập mới thành công",
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        course_id: courseId || '',
        due_date: '',
        max_score: '10',
        instructions: '',
        attachments: []
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bài tập",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Kiểm tra kích thước file
    const oversizedFiles = files.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Lỗi",
        description: "Một số file vượt quá 20MB",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
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
              <Label htmlFor="assignment-description">Mô tả ngắn</Label>
              <Input
                id="assignment-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về bài tập"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {!courseId && (
                <div>
                  <Label htmlFor="course-select">Khóa học *</Label>
                  <Select value={formData.course_id} onValueChange={(value) => setFormData({ ...formData, course_id: value })}>
                    <SelectTrigger id="course-select" aria-label="Chọn khóa học">
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
              )}
              <div>
                <Label htmlFor="due-date">Hạn nộp</Label>
                <div className="relative">
                  <Input
                    id="due-date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    aria-label="Chọn hạn nộp"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label htmlFor="max-score">Điểm tối đa</Label>
                <Input
                  id="max-score"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  placeholder="10"
                  aria-label="Nhập điểm tối đa"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="assignment-instructions">Hướng dẫn chi tiết *</Label>
              <Textarea
                id="assignment-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
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
                      <Button type="button" variant="outline" onClick={() => document.getElementById('assignment-files')?.click()}>
                        Chọn file đính kèm
                      </Button>
                      <p className="text-sm text-gray-500">PDF, DOC, Image, ZIP lên đến 20MB mỗi file</p>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createAssignmentMutation.isPending || uploading}
            >
              {createAssignmentMutation.isPending || uploading ? 'Đang tạo...' : 'Tạo bài tập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
