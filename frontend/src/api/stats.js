import client from './client';

export async function getStudyByHour(params={}) {
  const { data } = await client.get('/stats/study-by-hour', { params });
  return data?.data ?? [];
}
export async function getStudyHeatmap(params={}) {
  const { data } = await client.get('/stats/study-heatmap', { params });
  return data?.data ?? [];
}
