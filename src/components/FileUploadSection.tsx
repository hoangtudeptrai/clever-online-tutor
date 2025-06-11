
import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadSectionProps {
  attachments: File[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ 
  attachments, 
  onFileUpload, 
  onRemoveAttachment 
}) => {
  return (
    <div>
      <Label>File đính kèm mới (tùy chọn)</Label>
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('edit-assignment-files')?.click()}
              >
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
            onChange={onFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label>File mới đã chọn:</Label>
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveAttachment(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
