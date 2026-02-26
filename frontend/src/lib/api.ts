import axios from "axios";

const isLocal = window.location.hostname === "localhost";
const prodDomain = "celianhamon.fr";

export const API_BASE_URL = isLocal
    ? "http://localhost:8000/api/v1"
    : `https://${prodDomain}/api/v1`;

export const CHAT_BASE_URL = isLocal
    ? "http://localhost:8001/api/v1"
    : `https://${prodDomain}/api/v1`;

const api = axios.create({
    baseURL: API_BASE_URL,
});

const chatApi = axios.create({
    baseURL: CHAT_BASE_URL,
});

[api, chatApi].forEach((instance) => {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
});

export { chatApi };
export default api;
