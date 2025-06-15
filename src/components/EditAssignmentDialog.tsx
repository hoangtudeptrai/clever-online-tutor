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
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
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
import { useAssignmentFiles, useUploadAssignmentFile } from '@/hooks/useAssignmentFiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AssignmentFilesList from './AssignmentFilesList';

interface EditAssignmentDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EditAssignmentDialog: React.FC<EditAssignmentDialogProps> = ({ assignment, open, onOpenChange, onSuccess }) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: assignment.title,
    description: assignment.description || '',
    course_id: assignment.course_id,
    due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
    max_score: assignment.max_score?.toString() || '100'
  });
  const [newAttachments, setNewAttachments] = useState<File[]>([]);

  const updateAssignmentMutation = useUpdateAssignment();
  const uploadFileMutation = useUploadAssignmentFile();
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
      setNewAttachments([]);
    }
  }, [assignment]);

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

    setNewAttachments([...newAttachments, ...files]);
  };

  const removeNewAttachment = (index: number) => {
    const updatedAttachments = newAttachments.filter((_, i) => i !== index);
    setNewAttachments(updatedAttachments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update assignment
      await updateAssignmentMutation.mutateAsync({
        id: assignment.id,
        title: formData.title,
        description: formData.description,
        course_id: formData.course_id,
        due_date: formData.due_date || null,
        max_score: parseInt(formData.max_score),
        assignment_status: assignment.assignment_status
      });

      // Upload new files if any
      if (newAttachments.length > 0 && profile?.id) {
        const uploadPromises = newAttachments.map(file =>
          uploadFileMutation.mutateAsync({
            assignmentId: assignment.id,
            file,
            uploadedBy: profile.id,
            title: file.name
          })
        );
        
        await Promise.all(uploadPromises);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['course-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', assignment.id] });
      queryClient.invalidateQueries({ queryKey: ['assignment-files', assignment.id] });
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật bài tập thành công",
      });

      // Call onSuccess callback if provided
      onSuccess?.();

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bài tập",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài tập</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bài tập và quản lý file đính kèm
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form section */}
          <div>
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

              {/* New file upload section */}
              <div>
                <Label>Thêm file mới</Label>
                <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="space-y-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('new-assignment-files')?.click()}>
                          Chọn file đính kèm
                        </Button>
                        <p className="text-xs text-gray-500">PDF, DOC, Image, ZIP lên đến 20MB</p>
                      </div>
                    </div>
                    <input
                      id="new-assignment-files"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {newAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-sm">File mới được chọn:</Label>
                    {newAttachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                        <span>{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewAttachment(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={updateAssignmentMutation.isPending || uploadFileMutation.isPending}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateAssignmentMutation.isPending || uploadFileMutation.isPending}
                >
                  {updateAssignmentMutation.isPending || uploadFileMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật bài tập'}
                </Button>
              </div>
            </form>
          </div>

          {/* Files section */}
          <div>
            <AssignmentFilesList 
              assignmentId={assignment.id} 
              canDelete={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssignmentDialog;
