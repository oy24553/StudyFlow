import { useEffect, useMemo, useState } from 'react';
import { getStudySeries } from '../api/stats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function ChartSeries({ days = 90, bucket = 'day' }) {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    const { rows: r } = await getStudySeries({ from: from.toISOString(), to: to.toISOString(), bucket });
    setRows(r || []);
  };

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener('study-updated', fn);
    return () => window.removeEventListener('study-updated', fn);
  }, [days, bucket]);

  const data = useMemo(
    () =>
      rows.map((r) => ({
        t: fmtT(r.t, bucket),
        mins: Math.round(r.mins || 0),
      })),
    [rows, bucket]
  );

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="t" />
          <YAxis tickFormatter={minsFmt} />
          <Tooltip formatter={(v) => minsFmt(v)} />
          <Line type="monotone" dataKey="mins" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive animationDuration={600} animationBegin={0} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function fmtT(t, bucket) {
  if (!t) return '';
  const d = new Date(t);
  if (bucket === 'month') return d.toISOString().slice(0, 7);
  return d.toISOString().slice(0, 10);
}

function minsFmt(m) {
  const mm = Math.round(m || 0);
  const h = Math.floor(mm / 60);
  const rest = mm % 60;
  return h ? `${h}h ${rest}m` : `${rest}m`;
}
