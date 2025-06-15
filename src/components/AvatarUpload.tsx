
import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName: string;
  size?: 'sm' | 'md' | 'lg';
  showUploadButton?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  userName,
  size = 'lg',
  showUploadButton = true
}) => {
  const [uploading, setUploading] = useState(false);
  const { uploadAvatar } = useAuth();
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "File không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await uploadAvatar(file);
      if (error) {
        throw error;
      }
      toast({
        title: "Thành công",
        description: "Avatar đã được cập nhật",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} mx-auto`}>
        <AvatarImage src={currentAvatarUrl} alt={userName} />
        <AvatarFallback className={size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm'}>
          {userName?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      {showUploadButton && (
        <div className="absolute -bottom-2 -right-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button
              variant="default"
              size="icon"
              className="rounded-full shadow-lg cursor-pointer"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className={iconSizes[size]} />
                )}
              </span>
            </Button>
          </label>
        </div>
      )}
      
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
