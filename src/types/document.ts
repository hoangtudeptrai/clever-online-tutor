export interface Document {
  id: string;
  course_id: string;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  download_count: number;
  uploaded_by: string;
  createdAt: string;
  updatedAt: string;
}