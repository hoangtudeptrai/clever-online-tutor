import { User } from "./auth";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration: string; // in minutes
//   level: CourseLevel;
//   status: CourseStatus;
  lessons_count: number;
  students_count: number;
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
  lessons_count: number;
  students_count: number;
}

export interface TeacherCourse {
  id: string;
  title: string;
  description: string;
  lessons_count: number;
  students_count: number;
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