

export const AUTH_API = {
    LOGIN: `/auth/login`,
    REGISTER: `users`
} as const;

export const USERS_API = {
    GET_ALL: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`
} as const;

export const COURSES_API = {
    GET_ALL: '/courses',
    GET_BY_ID: (id: string) => `/courses/${id}`,
    GET_BY_STUDENT_ID: (student_id: string) => `/courses/enrolled?student_id=${student_id}`,
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`
} as const;

export const COURSE_ENROLLMENTS_API = {
    GET_ALL: '/enrollments',
    GET_BY_ID: (id: string) => `/enrollments/${id}`,
    GET_BY_STUDENT_ID: (student_id: string) => `/enrollments/student/${student_id}`,
    GET_BY_COURSE_ID: (course_id: string) => `/enrollments/course/${course_id}`,
    CREATE: '/enrollments',
    UPDATE: (id: string) => `/enrollments/${id}`,
    DELETE: (id: string) => `/enrollments/${id}`
} as const;

export const COURSE_DOCUMENT_API = {
    GET_ALL: '/course-documents',
    GET_BY_ID: (id: string) => `/course-documents/${id}`,
    GET_BY_COURSE_ID: (course_id: string) => `/course-documents/course/${course_id}`,
    CREATE: '/course-documents',
    UPDATE: (id: string) => `/course-documents/${id}`,
    DELETE: (id: string) => `/course-documents/${id}`
} as const;

export const ASSIGNMENTS_API = {
    GET_ALL: '/assignments',
    GET_BY_ID: (id: string) => `/assignments/${id}`,
    GET_BY_COURSE_ID: (course_id: string) => `/assignments/course/${course_id}`,
    CREATE: '/assignments',
    UPDATE: (id: string) => `/assignments/${id}`,
    DELETE: (id: string) => `/assignments/${id}`
} as const;

export const ASSIGNMENT_DOCUMENTS_API = {
    GET_ALL: '/assignment-documents',
    GET_BY_ID: (id: string) => `/assignment-documents/${id}`,
    GET_BY_ASSIGNMENT_ID: (assignment_id: string) => `/assignment-documents/assignment/${assignment_id}`,
    CREATE: '/assignment-documents',
    UPDATE: (id: string) => `/assignment-documents/${id}`,
    DELETE: (id: string) => `/assignment-documents/${id}`
} as const;

export const ASSIGNMENT_SUBMISSIONS_API = {
    GET_ALL: '/assignment-submissions',
    GET_BY_ID: (id: string) => `/assignment-submissions/${id}`,
    GET_BY_ASSIGNMENT_ID: (assignment_id: string) => `/assignment-submissions/assignment/${assignment_id}`,
    CREATE: '/assignment-submissions',
    UPDATE: (id: string) => `/assignment-submissions/${id}`,
    DELETE: (id: string) => `/assignment-submissions/${id}`
} as const;

export const ASSIGNMENT_SUBMISSION_FILES_API = {
    GET_ALL: '/assignment-submission-files',
    GET_BY_ID: (id: string) => `/assignment-submission-files/${id}`,
    CREATE: '/assignment-submission-files',
    UPDATE: (id: string) => `/assignment-submission-files/${id}`,
    DELETE: (id: string) => `/assignment-submission-files/${id}`
} as const;

export const FILES_API = {
    UPLOAD: (user_id: string) => `/upload?user_id=${user_id}`,
    GET_FILE: (objectName: string) => `/file?objectName=${objectName}`
} as const;