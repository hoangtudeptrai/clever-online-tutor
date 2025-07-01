
import React from 'react';
import { Calendar } from 'lucide-react';
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

interface AssignmentFormProps {
  formData: {
    title: string;
    description: string;
    course: string;
    dueDate: string;
    maxGrade: string;
    instructions: string;
  };
  onFormDataChange: (data: any) => void;
  courses: string[];
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ formData, onFormDataChange, courses }) => {
  const updateFormData = (field: string, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-assignment-title">Tiêu đề bài tập *</Label>
        <Input
          id="edit-assignment-title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Nhập tiêu đề bài tập"
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-assignment-description">Mô tả ngắn</Label>
        <Input
          id="edit-assignment-description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Mô tả ngắn gọn về bài tập"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Khóa học *</Label>
          <Select value={formData.course} onValueChange={(value) => updateFormData('course', value)}>
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
              onChange={(e) => updateFormData('dueDate', e.target.value)}
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
            onChange={(e) => updateFormData('maxGrade', e.target.value)}
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-assignment-instructions">Hướng dẫn chi tiết *</Label>
        <Textarea
          id="edit-assignment-instructions"
          value={formData.instructions}
          onChange={(e) => updateFormData('instructions', e.target.value)}
          placeholder="Nhập hướng dẫn chi tiết cho bài tập..."
          className="min-h-[150px]"
          required
        />
      </div>
    </div>
  );
};

export default AssignmentForm;
