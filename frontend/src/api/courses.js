// Course-related API
import client from './client';

export async function listCourses() {
    const { data } = await client.get('/courses');
    return data?.data ?? [];
}

export async function createCourse(payload) {
    const { data } = await client.post('/courses', payload);
    return data?.data;
}

export async function updateCourse(id, payload) {
    const { data } = await client.patch(`/courses/${id}`, payload);
    return data?.data;
}

export async function removeCourse(id) {
    const { data } = await client.delete(`/courses/${id}`);
    return data?.data;
}
