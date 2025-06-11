
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AssignmentForm from './AssignmentForm';
import FileUploadSection from './FileUploadSection';

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
          <AssignmentForm
            formData={formData}
            onFormDataChange={setFormData}
            courses={courses}
          />

          <FileUploadSection
            attachments={formData.attachments}
            onFileUpload={handleFileUpload}
            onRemoveAttachment={removeAttachment}
          />

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
