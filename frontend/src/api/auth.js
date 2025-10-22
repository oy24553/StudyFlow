// Simple wrapper for auth-related requests
import client from './client';

// Login: on success store token in localStorage
export async function login({ email, password }) {
    const { data } = await client.post('/auth/login', { email, password });
    const token = data?.data?.token;
    if (token) localStorage.setItem('token', token);
    return data?.data;
}

// Register: after successful registration, log the user in
export async function register({ email, password, name }) {
    await client.post('/auth/register', { email, password, name });
    return login({ email, password });
}

// Logout: remove token
export function logout() {
    localStorage.removeItem('token');
}

// Is authed (for frontend checks)
export function isAuthed() {
    return Boolean(localStorage.getItem('token'));
}
