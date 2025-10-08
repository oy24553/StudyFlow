import { useEffect, useState } from 'react';
import Chart7d from '../components/Chart7d';
import StudyTimer from '../components/StudyTimer';
import client from '../api/client';
import ChartCourseTop from '../components/ChartCourseTop';
import PageEnter from '../components/PageEnter';
import AnimatedCard from '../components/AnimatedCard';
import PrimaryButton from '../components/PrimaryButton';

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
        <PageEnter>
            <div className="vstack">
                <div className="hstack" style={{ gap: 12 }}>
                    <AnimatedCard><div className="stat"><div className="label">本周学习总时长</div><div className="value">{fmtM(stats.weekMins)}</div></div></AnimatedCard>
                    <AnimatedCard delay={0.05}><div className="stat"><div className="label">连续学习天数</div><div className="value">{stats.streak} 天</div></div></AnimatedCard>
                </div>

                <AnimatedCard delay={0.1}>
                    {/* 你的 StudyTimer */}
                    <StudyTimer />
                </AnimatedCard>

                <AnimatedCard delay={0.15}>
                    <div className="label">近 7 天学习时长</div>
                    <Chart7d />
                </AnimatedCard>

                {/* 如果有课程Top图，同样用 <AnimatedCard delay={0.2}> 包裹 */}
            </div>
        </PageEnter>
    );
}
function fmtM(m) { const h = Math.floor(m / 60), mm = m % 60; return h ? `${h}h ${mm}m` : `${mm}m`; }
