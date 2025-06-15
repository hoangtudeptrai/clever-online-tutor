
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Image, FileText } from 'lucide-react';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const FileUploadButton = ({ 
  onFileSelect, 
  accept = "*/*",
  className,
  variant = "ghost",
  size = "icon"
}: FileUploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input
    event.target.value = '';
  };

  const getIcon = () => {
    if (accept.includes('image')) return <Image className="h-4 w-4" />;
    if (accept.includes('text') || accept.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
      >
        {getIcon()}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};

export default FileUploadButton;
