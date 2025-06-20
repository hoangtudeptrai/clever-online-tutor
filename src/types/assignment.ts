export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  due_date: string;
  created_by: string;
  creator: string;
  status: string;
  max_score: number;
  assignment_status: string;
  attachments: File[];
  submitted: number;
  total: number;
  feedback: string;
  submitted_files: File[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentDocument {
  id: string;
  assignment_id: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string;
  grade: number;
  feedback: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
