// User related interfaces
export interface User {
    id: string;
    email: string;
    password: string;
    fullName: string;
    avatar?: string;
    role: 'student' | 'tutor' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    userId: string;
    bio?: string;
    phoneNumber?: string;
    address?: string;
    education?: string;
    experience?: string; // For tutors
    specializations?: string[]; // For tutors
    user: User;
}

// Course related interfaces
export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    price: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    tutorId: string;
    tutor: User;
    createdAt: Date;
    updatedAt: Date;
    lessons: Lesson[];
    enrollments: Enrollment[];
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    content: string;
    duration: number; // in minutes
    order: number;
    type: 'video' | 'text' | 'quiz';
    resources: Resource[];
    course: Course;
    createdAt: Date;
    updatedAt: Date;
}

export interface Resource {
    id: string;
    lessonId: string;
    title: string;
    type: 'pdf' | 'video' | 'link';
    url: string;
    lesson: Lesson;
}

// Learning interactions
export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'active' | 'completed' | 'cancelled';
    progress: number;
    user: User;
    course: Course;
    createdAt: Date;
    updatedAt: Date;
}

export interface Progress {
    id: string;
    enrollmentId: string;
    lessonId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    lastAccessedAt: Date;
    enrollment: Enrollment;
    lesson: Lesson;
}

export interface Quiz {
    id: string;
    lessonId: string;
    title: string;
    questions: Question[];
    lesson: Lesson;
}

export interface Question {
    id: string;
    quizId: string;
    content: string;
    type: 'multiple_choice' | 'true_false' | 'essay';
    options?: string[];
    correctAnswer?: string;
    quiz: Quiz;
}

export interface QuizAttempt {
    id: string;
    userId: string;
    quizId: string;
    score: number;
    answers: Answer[];
    user: User;
    quiz: Quiz;
    createdAt: Date;
}

export interface Answer {
    id: string;
    attemptId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    attempt: QuizAttempt;
    question: Question;
}

// Payment related interfaces
export interface Payment {
    id: string;
    userId: string;
    courseId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: string;
    transactionId?: string;
    user: User;
    course: Course;
    createdAt: Date;
}

// Review and rating
export interface Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    user: User;
    course: Course;
    createdAt: Date;
    updatedAt: Date;
}

// Communication
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
    sender: User;
    receiver: User;
    createdAt: Date;
}

// Notification
export interface Notification {
    id: string;
    userId: string;
    title: string;
    content: string;
    type: 'system' | 'course' | 'message';
    isRead: boolean;
    user: User;
    createdAt: Date;
} 