import axios from 'axios';

const instance = axios.create({
    // baseURL: 'https://flycarrot10011413.fly.dev/api' || process.env.REACT_APP_API_URL,
    baseURL:  process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 응답 인터셉터 추가
instance.interceptors.response.use(
    (response) => {
        const token = response.headers['authorization'];
        if (token) {
            // 토큰을 로컬 스토리지에 저장
            localStorage.setItem('token', token);
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
