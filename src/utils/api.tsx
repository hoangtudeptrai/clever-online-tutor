import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API || 'http://127.0.0.1:8080/vms/api/v0';

// Tạo instance axios với config mặc định
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
}

async function getToken() {
    if (typeof window === 'undefined') return ''
    const token = window.localStorage.getItem('access_token')
    return token && token.length > 0 ? `Bearer ${token}` : ''
}

api.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) {
        config.headers.Authorization = token
        config.withCredentials = false
    }

    return config
})

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response?.data?.data ? response?.data : response
    },
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

api.defaults.withCredentials = false

type Params = Record<string, any>
type Payload = Record<string, any>

export const getApi = <T = any>(url: string, params: Params = {}, other: AxiosRequestConfig = {}) => {
    return api.get<T>(url, { params, ...other })
}

export const postApi = <T = any>(url: string, payload: Payload = {}, other: AxiosRequestConfig = {}) => {
    return api.post<T>(url, payload, { ...other })
}

export const putApi = <T = any>(url: string, payload: Payload = {}, other: AxiosRequestConfig = {}) => {
    return api.put<T>(url, payload, { ...other })
}

export const patchApi = <T = any>(url: string, payload: Payload = {}, other: AxiosRequestConfig = {}) => {
    return api.patch<T>(url, payload, { ...other })
}

export const deleteApi = <T = any>(url: string, payload: Payload = {}, other: AxiosRequestConfig = {}) => {
    return api.delete<T>(url, { data: payload, ...other })
}