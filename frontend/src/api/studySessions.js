import client from './client';

export async function listStudySessions(params = {}) {
    const { from, to, course } = params;
    const { data } = await client.get('/study-sessions', { params: { from, to, course } });
    return data?.data ?? [];
}

export async function createStudySession(payload) {
    const { data } = await client.post('/study-sessions', payload);
    return data?.data;
}

export async function deleteStudySession(id) {
    const { data } = await client.delete(`/study-sessions/${id}`);
    return data?.data;
}
