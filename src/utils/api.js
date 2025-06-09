import axios from 'axios';

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
    DELETE: 'DELETE',
    PATCH: 'PATCH'
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
    (response) => {
        return (response?.data?.data ? response?.data : response)
    },
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

api.defaults.withCredentials = false

export const getApi = (url, params = {}, other = {}) => {
    return api.get(url, { params, ...other })
}

export const postApi = (url, payload = {}, other = {}) => {
    return api.post(url, payload, { ...other })
}

export const putApi = (url, payload = {}, other = {}) => {
    return api.put(url, payload, { ...other })
}

export const patchApi = (url, payload = {}, other = {}) => {
    return api.patch(url, payload, { ...other })
}

export const deleteApi = (url, payload = {}, other = {}) => {
    return api.delete(url, { payload, ...other })
}
