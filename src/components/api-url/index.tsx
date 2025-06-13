

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
  

export const FILES_API = {
    UPLOAD: (user_id: string) => `/upload?user_id=${user_id}`,
    GET_FILE: (objectName: string) => `/file?objectName=${objectName}`
} as const;