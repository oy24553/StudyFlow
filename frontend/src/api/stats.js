import client from './client';

export async function getStudyByHour(params={}) {
  const { data } = await client.get('/stats/study-by-hour', { params });
  return data?.data ?? [];
}
export async function getStudyHeatmap(params={}) {
  const { data } = await client.get('/stats/study-heatmap', { params });
  return data?.data ?? [];
}

export async function getCourseTop(params = {}) {
  const { data } = await client.get('/stats/course-top', { params });
  return data?.data ?? [];
}

export async function getMethodBreakdown(params = {}) {
  const { data } = await client.get('/stats/method-breakdown', { params });
  return data?.data ?? [];
}

export async function getStudySeries(params = {}) {
  const { data } = await client.get('/stats/study-series', { params });
  return { rows: data?.data ?? [], meta: data?.meta ?? {} };
}
