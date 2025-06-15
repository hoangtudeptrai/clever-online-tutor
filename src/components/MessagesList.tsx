
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useConversations } from '@/hooks/useConversations';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface MessagesListProps {
  onSelectConversation: (partnerId: string, partnerName: string) => void;
  selectedPartnerId?: string;
}

const MessagesList: React.FC<MessagesListProps> = ({ 
  onSelectConversation, 
  selectedPartnerId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: users, isLoading: usersLoading } = useUsers();

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes}p`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('vi-VN');
  };

  // Filter users based on search query, excluding current user and users already in conversations
  const filteredUsers = searchQuery ? users?.filter(user => 
    user.id !== profile?.id &&
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !conversations?.some(conv => conv.partnerId === user.id)
  ) : [];

  // Filter conversations based on search query
  const filteredConversations = searchQuery ? conversations?.filter(conv =>
    conv.partnerProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : conversations;

  if (conversationsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Tin nhắn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Tin nhắn</span>
        </CardTitle>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1 max-h-[500px] overflow-y-auto">
          {/* Search Results - New Users */}
          {searchQuery && filteredUsers && filteredUsers.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                Người dùng mới
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onSelectConversation(user.id, user.full_name)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Existing Conversations */}
          {filteredConversations && filteredConversations.length > 0 && (
            <>
              {searchQuery && filteredUsers && filteredUsers.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Cuộc trò chuyện
                </div>
              )}
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.partnerId}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${
                    selectedPartnerId === conversation.partnerId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent'
                  }`}
                  onClick={() => onSelectConversation(
                    conversation.partnerId, 
                    conversation.partnerProfile?.full_name || 'Unknown User'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.partnerProfile?.avatar_url} />
                      <AvatarFallback>
                        {conversation.partnerProfile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.partnerProfile?.full_name}
                        </p>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-600 text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(conversation.lastMessage.created_at)}</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {conversation.partnerProfile?.role === 'tutor' ? 'Giáo viên' : 'Học sinh'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* No results */}
          {searchQuery && (!filteredUsers || filteredUsers.length === 0) && (!filteredConversations || filteredConversations.length === 0) && (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Không tìm thấy kết quả nào</p>
            </div>
          )}

          {/* Empty state when no search and no conversations */}
          {!searchQuery && (!conversations || conversations.length === 0) && !conversationsLoading && (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chưa có tin nhắn nào</p>
              <p className="text-xs mt-2">Tìm kiếm người dùng để bắt đầu trò chuyện</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
