import { useEffect, useState } from 'react';
import { listStudySessions } from '../api/studySessions';
import { listCourses } from '../api/courses';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ChartCourseTop() {
  const [data, setData] = useState([]);

  const load = async () => {
    const to = new Date();
    const from = new Date(); from.setDate(to.getDate() - 30);
    const [sessions, courses] = await Promise.all([
      listStudySessions({ from: from.toISOString(), to: to.toISOString() }),
      listCourses()
    ]);
    const nameById = new Map(courses.map(c => [String(c._id || c.id), c.name]));
    const acc = new Map();
    for (const s of sessions) {
      const dur = s.endAt ? (new Date(s.endAt) - new Date(s.startAt)) / 60000 : 0;
      const key = String(s.courseId || 'uncat');
      acc.set(key, (acc.get(key) || 0) + Math.max(0, dur));
    }
    const rows = [...acc.entries()]
      .map(([k, mins]) => ({ name: k === 'uncat' ? '未分配' : (nameById.get(k) || '未知课程'), mins: Math.round(mins) }))
      .sort((a, b) => b.mins - a.mins)
      .slice(0, 5);
    setData(rows);
  };

  useEffect(() => { load(); const fn = () => load(); window.addEventListener('study-updated', fn); return () => window.removeEventListener('study-updated', fn); }, []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="mins" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
