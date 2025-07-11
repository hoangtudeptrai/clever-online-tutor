-- Add admin role to user_role enum if not exists
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Create RLS policies for admin access
-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can manage all courses
CREATE POLICY "Admins can manage all courses" 
ON public.courses 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can manage all assignments
CREATE POLICY "Admins can manage all assignments" 
ON public.assignments 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all enrollments
CREATE POLICY "Admins can view all enrollments" 
ON public.course_enrollments 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all submissions
CREATE POLICY "Admins can view all submissions" 
ON public.assignment_submissions 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all grades
CREATE POLICY "Admins can view all grades" 
ON public.grades 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all messages
CREATE POLICY "Admins can view all messages" 
ON public.messages 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all notifications
CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all documents
CREATE POLICY "Admins can view all course documents" 
ON public.course_documents 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

CREATE POLICY "Admins can view all assignment documents" 
ON public.assignment_documents 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);

-- Admin can view all submission files
CREATE POLICY "Admins can view all submission files" 
ON public.assignment_submission_files 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::user_role
);