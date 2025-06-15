
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft, Download, Eye, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMessages } from '@/hooks/useMessages';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useMarkConversationAsRead } from '@/hooks/useMessageActions';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import FileUploadButton from '@/components/FileUploadButton';

interface ChatWindowProps {
  conversationWith: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  onBack: () => void;
}

const ChatWindow = ({ conversationWith, onBack }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const { data: messagesData, isLoading } = useMessages(conversationWith.id, currentPage);
  const { sendMessage, isPending } = useSendMessage();
  const markConversationAsRead = useMarkConversationAsRead();

  // Combine all loaded messages
  useEffect(() => {
    if (messagesData?.data) {
      if (currentPage === 1) {
        setAllMessages(messagesData.data);
      } else {
        // Prepend older messages to the beginning
        setAllMessages(prev => [...messagesData.data, ...prev]);
      }
    }
  }, [messagesData, currentPage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (currentPage === 1) {
      scrollToBottom();
    }
  }, [allMessages, currentPage, scrollToBottom]);

  // Mark conversation as read when opening - ONLY ONCE
  useEffect(() => {
    if (conversationWith.id && !hasMarkedAsRead) {
      console.log('Marking conversation as read for:', conversationWith.id);
      markConversationAsRead.mutate(conversationWith.id);
      setHasMarkedAsRead(true);
    }
  }, [conversationWith.id, hasMarkedAsRead, markConversationAsRead]);

  // Reset mark as read flag when conversation changes
  useEffect(() => {
    setHasMarkedAsRead(false);
  }, [conversationWith.id]);

  const handleSend = useCallback(async () => {
    if ((!newMessage.trim() && !selectedFile) || isPending) {
      return;
    }

    const messageContent = newMessage.trim();
    const fileToSend = selectedFile;

    // Clear form immediately for better UX
    setNewMessage('');
    setSelectedFile(null);

    try {
      await sendMessage({
        receiverId: conversationWith.id,
        content: messageContent || '📎 Đã gửi file',
        file: fileToSend || undefined,
      });
      
      // Reset to page 1 after sending
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore form on error
      setNewMessage(messageContent);
      setSelectedFile(fileToSend);
    }
  }, [newMessage, selectedFile, isPending, sendMessage, conversationWith.id, currentPage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isImage = (fileType?: string) => {
    return fileType?.startsWith('image/');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const loadMoreMessages = () => {
    if (messagesData?.hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const isButtonDisabled = (!newMessage.trim() && !selectedFile) || isPending;

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-white flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={conversationWith.avatar} />
          <AvatarFallback>{conversationWith.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{conversationWith.name}</h3>
          <p className="text-sm text-gray-500">
            {conversationWith.role === 'tutor' ? 'Giảng viên' : 'Học sinh'}
          </p>
        </div>
      </div>

      {/* Messages with independent ScrollArea */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {/* Load More Button */}
            {messagesData?.hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreMessages}
                  disabled={isLoading}
                  className="mb-4"
                >
                  <ChevronUp className="h-4 w-4 mr-2" />
                  {isLoading ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
                </Button>
              </div>
            )}

            {allMessages.map((message) => {
              const isOwn = message.sender_id === profile?.id;
              const sender = isOwn ? profile : message.sender_profile;
              const isUnread = !isOwn && !message.is_read;
              
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[70%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={sender?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {sender?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`relative rounded-lg p-3 ${
                      isOwn 
                        ? 'bg-blue-500 text-white' 
                        : `${isUnread ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-100'} text-gray-900`
                    }`}>
                      {/* Unread indicator */}
                      {isUnread && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                      )}

                      {/* File attachment */}
                      {message.file_url && (
                        <div className="mb-2">
                          {isImage(message.file_type) ? (
                            <div className="relative">
                              <img 
                                src={message.file_url} 
                                alt={message.file_name}
                                className="max-w-full h-auto rounded cursor-pointer"
                                onClick={() => window.open(message.file_url, '_blank')}
                              />
                              <div className="mt-1 flex items-center justify-between text-xs opacity-75">
                                <span>{message.file_name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(message.file_url!, message.file_name!)}
                                  className={`h-6 w-6 p-1 ${isOwn ? 'text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Card className={`p-3 ${isOwn ? 'bg-blue-600 border-blue-400' : 'bg-white'}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                    {message.file_name}
                                  </p>
                                  <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {message.file_type}
                                  </p>
                                </div>
                                <div className="flex space-x-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(message.file_url, '_blank')}
                                    className={`h-8 w-8 p-1 ${isOwn ? 'text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(message.file_url!, message.file_name!)}
                                    className={`h-8 w-8 p-1 ${isOwn ? 'text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      )}
                      
                      {/* Message content */}
                      {message.content && message.content !== '📎 Đã gửi file' && (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      <div className={`flex items-center justify-between text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{format(new Date(message.created_at), 'HH:mm dd/MM', { locale: vi })}</span>
                        {!isOwn && (
                          <span className={`text-xs ${isUnread ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                            {isUnread ? 'Chưa đọc' : 'Đã đọc'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex-shrink-0">
        {selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">
                  File đã chọn: {selectedFile.name}
                </div>
                <Badge variant="secondary">
                  {formatFileSize(selectedFile.size)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelectedFile}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <FileUploadButton
            onFileSelect={handleFileSelect}
            accept="*/*"
            className="mb-1"
          />
          
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="resize-none"
              disabled={isPending}
            />
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={isButtonDisabled}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
