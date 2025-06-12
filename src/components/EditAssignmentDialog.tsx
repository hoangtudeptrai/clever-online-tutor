
import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateAssignment } from '@/hooks/useUpdateAssignment';
import { useCourses } from '@/hooks/useCourses';

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
    course_id: '',
    dueDate: assignment.dueDate,
    maxScore: assignment.maxScore.toString()
  });

  const updateAssignmentMutation = useUpdateAssignment();
  const { data: courses } = useCourses();

  useEffect(() => {
    if (courses && assignment.course) {
      const course = courses.find(c => c.title === assignment.course);
      if (course) {
        setFormData(prev => ({ ...prev, course_id: course.id }));
      }
    }
  }, [courses, assignment.course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateAssignmentMutation.mutate({
      assignmentId: assignment.id,
      assignmentData: {
        title: formData.title,
        description: formData.description,
        course_id: formData.course_id,
        due_date: formData.dueDate || null,
        max_score: parseInt(formData.maxScore)
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bài tập
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề bài tập *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề bài tập"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về bài tập"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Khóa học *</Label>
            <Select 
              value={formData.course_id} 
              onValueChange={(value) => setFormData({ ...formData, course_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Hạn nộp</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxScore">Điểm tối đa *</Label>
              <Input
                id="maxScore"
                type="number"
                min="1"
                max="1000"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateAssignmentMutation.isPending}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={updateAssignmentMutation.isPending}
            >
              {updateAssignmentMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật bài tập'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentDialog;
