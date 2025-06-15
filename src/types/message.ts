
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject?: string;
  content: string;
  created_at: string;
  is_read: boolean;
  replied_to?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  sender_profile?: {
    full_name: string;
    role: string;
    avatar_url?: string;
  };
  receiver_profile?: {
    full_name: string;
    role: string;
    avatar_url?: string;
  };
}
