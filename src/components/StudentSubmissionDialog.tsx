
import React, { useState } from 'react';
import { Send, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateSubmission } from '@/hooks/useSubmissions';

interface StudentSubmissionDialogProps {
  assignmentId: string;
  assignmentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentSubmissionDialog: React.FC<StudentSubmissionDialogProps> = ({
  assignmentId,
  assignmentTitle,
  open,
  onOpenChange
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const createSubmissionMutation = useCreateSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    createSubmissionMutation.mutate({
      assignmentId,
      content,
      files: attachments
    }, {
      onSuccess: () => {
        setContent('');
        setAttachments([]);
        onOpenChange(false);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nộp bài tập: {assignmentTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung bài làm *</Label>
            <Textarea
              id="content"
              placeholder="Nhập nội dung bài làm của bạn..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>File đính kèm (tùy chọn)</Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent className="p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('submission-files')?.click()}
                    >
                      Chọn file
                    </Button>
                    <p className="text-sm text-gray-500">
                      PDF, DOC, Image, ZIP lên đến 10MB mỗi file
                    </p>
                  </div>
                </div>
                <input
                  id="submission-files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>File đã chọn:</Label>
                {attachments.map((file, index) => (
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

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={createSubmissionMutation.isPending}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={!content.trim() || createSubmissionMutation.isPending}
            >
              {createSubmissionMutation.isPending ? (
                'Đang nộp...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSubmissionDialog;
