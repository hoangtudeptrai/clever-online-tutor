
-- Enable Row Level Security on assignment_submission_files table
ALTER TABLE public.assignment_submission_files ENABLE ROW LEVEL SECURITY;

-- Allow students to view their own submission files
CREATE POLICY "Students can view their own submission files"
ON public.assignment_submission_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions
    WHERE assignment_submissions.id = assignment_submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);

-- Allow tutors to view submission files in their courses
CREATE POLICY "Tutors can view submission files in their courses"
ON public.assignment_submission_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.courses c ON c.instructor_id = p.id
    JOIN public.assignments a ON a.course_id = c.id
    JOIN public.assignment_submissions s ON s.assignment_id = a.id
    WHERE p.id = auth.uid()
    AND p.role = 'tutor'
    AND s.id = assignment_submission_files.submission_id
  )
);

-- Allow students to insert files for their own submissions
CREATE POLICY "Students can insert their own submission files"
ON public.assignment_submission_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.assignment_submissions
    WHERE assignment_submissions.id = assignment_submission_files.submission_id
    AND assignment_submissions.student_id = auth.uid()
  )
);
