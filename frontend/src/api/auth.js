// 简单封装鉴权相关请求
import client from './client';

// 登录：成功后把 token 存到 localStorage
export async function login({ email, password }) {
    const { data } = await client.post('/auth/login', { email, password });
    const token = data?.data?.token;
    if (token) localStorage.setItem('token', token);
    return data?.data;
}

// 注册：注册成功后直接调用登录
export async function register({ email, password, name }) {
    await client.post('/auth/register', { email, password, name });
    return login({ email, password });
}

// 登出：清掉 token
export function logout() {
    localStorage.removeItem('token');
}

// 是否已登录（前端判断用）
export function isAuthed() {
    return Boolean(localStorage.getItem('token'));
}
