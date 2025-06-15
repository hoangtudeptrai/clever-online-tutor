
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface NewMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageSent: (partnerId: string, partnerName: string) => void;
}

const NewMessageDialog: React.FC<NewMessageDialogProps> = ({
  open,
  onOpenChange,
  onMessageSent,
}) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { profile } = useAuth();
  const { data: users, isLoading: usersLoading } = useUsers();
  const { sendMessage, isPending } = useSendMessage();

  // Filter users to exclude current user and show appropriate role
  const filteredUsers = users?.filter(user => 
    user.id !== profile?.id && 
    (profile?.role === 'student' ? user.role === 'tutor' : true)
  );

  const handleSend = async () => {
    if (!selectedUser || !content.trim()) return;

    try {
      await sendMessage({
        receiverId: selectedUser,
        subject: subject.trim() || undefined,
        content: content.trim(),
      });

      const selectedUserData = filteredUsers?.find(u => u.id === selectedUser);
      if (selectedUserData) {
        onMessageSent(selectedUser, selectedUserData.full_name);
      }

      // Reset form
      setSelectedUser('');
      setSubject('');
      setContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleClose = () => {
    setSelectedUser('');
    setSubject('');
    setContent('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tin nhắn mới</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Recipient Selection */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Người nhận</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người nhận" />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  filteredUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <span>{user.full_name}</span>
                        <span className="text-xs text-gray-500">
                          ({user.role === 'tutor' ? 'Giáo viên' : 'Học sinh'})
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Tiêu đề (tùy chọn)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề tin nhắn..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Nội dung</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              className="min-h-[120px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedUser || !content.trim() || isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Gửi tin nhắn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMessageDialog;
