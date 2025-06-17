export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  due_date: string;
  created_by: string;
  status: string;
  max_score: number;
  assignment_status: string;
  createdAt: string;
  updatedAt: string;
  // attachments: AssignmentDocument[];
  attachments: File[];
}

export interface AssignmentDocumentForm {
  title: string;
  description: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
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