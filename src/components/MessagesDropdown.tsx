
import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface MessagesDropdownProps {
  unreadCount: number;
}

const MessagesDropdown: React.FC<MessagesDropdownProps> = ({ unreadCount }) => {
  const { data: conversations } = useConversations();

  const truncateContent = (content: string, maxLength: number = 40) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Tin nhắn</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} chưa đọc
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {conversations && conversations.length > 0 ? (
          <>
            {conversations.map((conversation) => (
              <DropdownMenuItem key={conversation.partnerId} className="flex items-start space-x-3 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={conversation.partnerProfile?.avatar_url} />
                  <AvatarFallback>
                    {conversation.partnerProfile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${conversation.unreadCount > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                      {conversation.partnerProfile?.full_name}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-4 w-4 p-0 text-xs flex items-center justify-center">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {truncateContent(conversation.lastMessage.content)}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/messages" className="w-full text-center py-2 text-blue-600 hover:text-blue-700">
                Xem tất cả tin nhắn
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessagesDropdown;
