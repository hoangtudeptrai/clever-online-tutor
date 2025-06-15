
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MessagesList from '@/components/MessagesList';
import ChatWindow from '@/components/ChatWindow';

const Messages = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>();
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>();
  const [selectedPartnerRole, setSelectedPartnerRole] = useState<string>();
  const [selectedPartnerAvatar, setSelectedPartnerAvatar] = useState<string>();

  const handleSelectConversation = (partnerId: string, partnerName: string, partnerRole?: string, partnerAvatar?: string) => {
    setSelectedPartnerId(partnerId);
    setSelectedPartnerName(partnerName);
    setSelectedPartnerRole(partnerRole || 'student');
    setSelectedPartnerAvatar(partnerAvatar);
  };

  const handleBackToList = () => {
    setSelectedPartnerId(undefined);
    setSelectedPartnerName(undefined);
    setSelectedPartnerRole(undefined);
    setSelectedPartnerAvatar(undefined);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tin nhắn</h1>
          <p className="text-gray-600 mt-2">
            Giao tiếp với giáo viên và học sinh
          </p>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <MessagesList 
              onSelectConversation={handleSelectConversation}
              selectedPartnerId={selectedPartnerId}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedPartnerId && selectedPartnerName ? (
              <ChatWindow 
                conversationWith={{
                  id: selectedPartnerId,
                  name: selectedPartnerName,
                  role: selectedPartnerRole || 'student',
                  avatar: selectedPartnerAvatar
                }}
                onBack={handleBackToList}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chọn một cuộc trò chuyện
                  </h3>
                  <p className="text-gray-500">
                    Chọn một người từ danh sách để bắt đầu nhắn tin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
