import { useEffect, useState } from 'react';
import Chart7d from '../components/Chart7d';
import StudyTimer from '../components/StudyTimer';
import client from '../api/client';
import ChartCourseTop from '../components/ChartCourseTop';

export default function Dashboard() {
    const [stats, setStats] = useState({ weekMins: 0, streak: 0 });

    const calc = (rows) => {
        const weekMins = Math.round(rows.reduce((s, r) => s + (r.total || r.mins || 0), 0));
        // 连续天数（倒序找连续>0的天数）
        const byDay = new Map(rows.map(r => [r._id || r.day, Math.round(r.total || r.mins || 0)]));
        let streak = 0, d = new Date();
        for (let i = 0; i < 30; i++) {
            const key = d.toISOString().slice(0, 10);
            const val = byDay.get(key) || 0;
            if (val > 0) streak++; else break;
            d.setDate(d.getDate() - 1);
        }
        setStats({ weekMins, streak });
    };

    const load = async () => {
        const res = await client.get('/stats/study-7d');
        calc(res.data.data || []);
    };

    useEffect(() => {
        load();
        const fn = () => load();
        window.addEventListener('study-updated', fn);
        return () => window.removeEventListener('study-updated', fn);
    }, []);

    return (
        <div className="vstack">
            <div className="hstack" style={{ gap: 12 }}>
                <div className="card"><div className="label">本周学习总时长</div><div style={{ fontSize: 22, fontWeight: 700 }}>{fmtM(stats.weekMins)}</div></div>
                <div className="card"><div className="label">连续学习天数</div><div style={{ fontSize: 22, fontWeight: 700 }}>{stats.streak} 天</div></div>
            </div>
            <StudyTimer />
            <div className="card vstack">
                <div className="label">近 7 天学习时长</div>
                <Chart7d />
            </div>
            <div className="card vstack">
                <div className="label">近 30 天课程 Top 5（分钟）</div>
                <ChartCourseTop />
            </div>
        </div>
    );
}
function fmtM(m) { const h = Math.floor(m / 60), mm = m % 60; return h ? `${h}h ${mm}m` : `${mm}m`; }
