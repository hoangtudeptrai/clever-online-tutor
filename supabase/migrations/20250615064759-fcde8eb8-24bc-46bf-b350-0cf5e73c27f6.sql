
-- Create storage bucket for message files
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-files', 'message-files', true);

-- Create RLS policies for message files bucket
CREATE POLICY "Users can upload their own message files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view message files"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-files');

CREATE POLICY "Users can delete their own message files"
ON storage.objects FOR DELETE
USING (bucket_id = 'message-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file_url column to messages table for attachments
ALTER TABLE public.messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;
