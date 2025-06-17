

export const AUTH_API = {
    LOGIN: `/auth/login`,
    REGISTER: `users`
} as const;

export const USERS_API = {
} as const;

export const COURSES_API = {
    GET_ALL: '/courses',
    GET_BY_ID: (id: string) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`
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
    CREATE: '/assignment-documents',
    UPDATE: (id: string) => `/assignment-documents/${id}`,
    DELETE: (id: string) => `/assignment-documents/${id}`
} as const;

export const ASSIGNMENT_SUBMISSIONS_API = {
    GET_ALL: '/assignment-submissions',
    GET_BY_ID: (id: string) => `/assignment-submissions/${id}`,
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