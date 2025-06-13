export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration: string; // in minutes
//   level: CourseLevel;
//   status: CourseStatus;
  lesson_count: number;
  student_count: number;
  instructor_id: string;
  created_at: string;
  updated_at: string;
}

// export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

// export type CourseStatus = 'draft' | 'published' | 'archived';
export interface CourseBasicInfo {
  id: string ;
  title: string;
  description: string;
  instructor_id: string;
  duration: string;
  thumbnail?: string;
}

export interface CourseRequest {
  title: string;
  description: string;
  thumbnail?: string;
  duration: string;
  instructor_id: string;
  maxStudents: number;
//   level: CourseLevel;
//   status: CourseStatus;
}

export interface CourseResponse {
  data: Course;
  message: string;
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
} 

export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  students: number;
  lessons: number;
  progress: number;
  status: string;
  thumbnail: string;
  duration: string;
  instructor_id: string;
}

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  lessons: number;
  completedLessons: number;
  status: string;
  thumbnail: string;
  rating: number;
  nextLesson: string | null;
  instructor_id: string;
}