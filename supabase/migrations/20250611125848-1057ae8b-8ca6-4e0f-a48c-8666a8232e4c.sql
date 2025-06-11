
-- Tạo storage bucket cho course thumbnails (chỉ tạo những bucket chưa có)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('assignment-files', 'assignment-files', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/avi', 'video/quicktime', 'image/jpeg', 'image/png', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Cập nhật bucket course-documents để có đúng file types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/avi', 'video/quicktime', 'image/jpeg', 'image/png', 'application/zip'],
    file_size_limit = 52428800
WHERE id = 'course-documents';

-- Tạo RLS policies cho course-thumbnails bucket (chỉ tạo nếu chưa có)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view course thumbnails') THEN
    CREATE POLICY "Anyone can view course thumbnails" ON storage.objects
      FOR SELECT USING (bucket_id = 'course-thumbnails');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload course thumbnails') THEN
    CREATE POLICY "Authenticated users can upload course thumbnails" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their course thumbnails') THEN
    CREATE POLICY "Users can update their course thumbnails" ON storage.objects
      FOR UPDATE USING (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their course thumbnails') THEN
    CREATE POLICY "Users can delete their course thumbnails" ON storage.objects
      FOR DELETE USING (bucket_id = 'course-thumbnails' AND auth.role() = 'authenticated');
  END IF;

  -- RLS policies cho assignment-files bucket
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view assignment files') THEN
    CREATE POLICY "Anyone can view assignment files" ON storage.objects
      FOR SELECT USING (bucket_id = 'assignment-files');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload assignment files') THEN
    CREATE POLICY "Authenticated users can upload assignment files" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their assignment files') THEN
    CREATE POLICY "Users can update their assignment files" ON storage.objects
      FOR UPDATE USING (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their assignment files') THEN
    CREATE POLICY "Users can delete their assignment files" ON storage.objects
      FOR DELETE USING (bucket_id = 'assignment-files' AND auth.role() = 'authenticated');
  END IF;
END $$;
