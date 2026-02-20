import { useEffect, useState } from 'react';
import { getCourseTop } from '../api/stats';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function ChartCourseTop({ days = 30, limit = 5 }) {
  const [data, setData] = useState([]);

  const load = async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const rows = await getCourseTop({ from: from.toISOString(), to: to.toISOString(), limit });
    setData(rows.map((r) => ({ name: r.name, mins: r.mins })));
  };

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener('study-updated', fn);
    return () => window.removeEventListener('study-updated', fn);
  }, [days, limit]);

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
