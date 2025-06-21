import { User } from "./auth";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration: string; // in minutes
  lessons_count: number;
  students_count: number;
  instructor_id: string;
  created_at: string;
  updated_at: string;
  instructor: string;
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
  lessons_count: number;
  students_count: number;
}

export interface TeacherCourse extends Course {
  progress: number;
  status: string;
}

export interface StudentCourse extends Course {
  progress: number;
  status: string;
  instructor: string;
  rating: number;
  nextLesson: string | null;
  lessons: number;
  completedLessons: number;
}

export interface CourseEnrollment {
	id: string;
	course_id: string;
	enrolled_at: string;
	status: string;
	last_active: string;
	progress: number;
  student_code: string;
	student_id: string;
	full_name: string;
	email: string;
	avatar: string;
	phone: string;
  createdAt: string;
  updatedAt: string;
}