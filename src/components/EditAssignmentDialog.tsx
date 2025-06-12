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
import { useUpdateAssignment } from '@/hooks/useAssignments';
import { useCourses } from '@/hooks/useCourses';
import { Assignment } from '@/hooks/useAssignments';
import { useQueryClient } from '@tanstack/react-query';

interface EditAssignmentDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAssignmentDialog: React.FC<EditAssignmentDialogProps> = ({ assignment, open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: assignment.title,
    description: assignment.description || '',
    course_id: assignment.course_id,
    due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
    max_score: assignment.max_score?.toString() || '100'
  });

  const updateAssignmentMutation = useUpdateAssignment();
  const { data: courses } = useCourses();

  useEffect(() => {
    if (assignment) {
      setFormData({
        title: assignment.title,
        description: assignment.description || '',
        course_id: assignment.course_id,
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
        max_score: assignment.max_score?.toString() || '100'
      });
    }
  }, [assignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateAssignmentMutation.mutate({
      id: assignment.id,
      title: formData.title,
      description: formData.description,
      course_id: formData.course_id,
      due_date: formData.due_date || null,
      max_score: parseInt(formData.max_score),
      assignment_status: assignment.assignment_status
    }, {
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['course-assignments'] });
        queryClient.invalidateQueries({ queryKey: ['assignment', assignment.id] });
        // Close dialog
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
              <Label htmlFor="due_date">Hạn nộp</Label>
              <Input
                id="due_date"
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_score">Điểm tối đa *</Label>
              <Input
                id="max_score"
                type="number"
                min="1"
                max="1000"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
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
