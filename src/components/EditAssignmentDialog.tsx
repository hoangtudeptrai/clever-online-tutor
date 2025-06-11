
import React, { useState } from 'react';
import { Upload, X, Calendar } from 'lucide-react';
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

interface EditAssignmentDialogProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    course: string;
    dueDate: string;
    maxScore: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAssignmentDialog: React.FC<EditAssignmentDialogProps> = ({ assignment, open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    title: assignment.title,
    description: assignment.description,
    course: assignment.course,
    dueDate: assignment.dueDate,
    maxGrade: assignment.maxScore.toString(),
    instructions: 'Hướng dẫn chi tiết cho bài tập...',
    attachments: [] as File[]
  });

  const courses = [
    'Lập trình Web',
    'React Nâng cao',
    'Node.js Cơ bản',
    'Database Design'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cập nhật bài tập:', formData);
    // Logic cập nhật bài tập
    onOpenChange(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: newAttachments });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bài tập
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-assignment-title">Tiêu đề bài tập *</Label>
              <Input
                id="edit-assignment-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài tập"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-assignment-description">Mô tả ngắn *</Label>
              <Input
                id="edit-assignment-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn gọn về bài tập"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="edit-due-date">Hạn nộp *</Label>
                <div className="relative">
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-max-grade">Điểm tối đa</Label>
                <Input
                  id="edit-max-grade"
                  type="number"
                  value={formData.maxGrade}
                  onChange={(e) => setFormData({ ...formData, maxGrade: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-assignment-instructions">Hướng dẫn chi tiết *</Label>
              <Textarea
                id="edit-assignment-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Nhập hướng dẫn chi tiết cho bài tập..."
                className="min-h-[150px]"
                required
              />
            </div>

            <div>
              <Label>File đính kèm mới (tùy chọn)</Label>
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Button type="button" variant="outline" onClick={() => document.getElementById('edit-assignment-files')?.click()}>
                        Thêm file đính kèm mới
                      </Button>
                      <p className="text-sm text-gray-500">PDF, DOC, Image, ZIP lên đến 20MB mỗi file</p>
                    </div>
                  </div>
                  <input
                    id="edit-assignment-files"
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
                  <Label>File mới đã chọn:</Label>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Cập nhật bài tập
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentDialog;
