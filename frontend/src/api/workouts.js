import client from './client';

export async function listWorkouts(params = {}) {
    const { from, to } = params;
    const { data } = await client.get('/workouts', { params: { from, to } });
    return data?.data ?? [];
}
