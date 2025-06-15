export interface Document {
  id: string;
  url: string;
  created_at: string;
  updated_at: string;
  course_id: string;
  instructor_id: string;
  student_id: string;
  type: string;
  size: number;
  downloads: number;
  uploadDate: string;
  category: string;
  description: string;
  title: string;
}