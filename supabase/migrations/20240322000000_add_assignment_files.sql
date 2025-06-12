-- Create assignment_files table
CREATE TABLE assignment_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE assignment_files ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to all authenticated users"
  ON assignment_files
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert access to tutors only
CREATE POLICY "Allow insert access to tutors only"
  ON assignment_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tutor'
    )
  );

-- Allow delete access to tutors who created the assignment
CREATE POLICY "Allow delete access to tutors who created the assignment"
  ON assignment_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.id = assignment_files.assignment_id
      AND assignments.created_by = auth.uid()
    )
  ); 