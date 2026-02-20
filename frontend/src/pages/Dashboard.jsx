import { useEffect, useState } from 'react';
import Chart7d from '../components/Chart7d';
import StudyTimer from '../components/StudyTimer';
import client from '../api/client';
import ChartCourseTop from '../components/ChartCourseTop';
import PageEnter from '../components/PageEnter';
import AnimatedCard from '../components/AnimatedCard';
import PrimaryButton from '../components/PrimaryButton';
import ChartHeatmap from '../components/ChartHeatmap';
import ChartMethodBreakdown from '../components/ChartMethodBreakdown';
import ChartSeries from '../components/ChartSeries';

export default function Dashboard() {
    const [stats, setStats] = useState({ weekMins: 0, streak: 0 });
    const [seriesDays, setSeriesDays] = useState(90);
    const [seriesBucket, setSeriesBucket] = useState('week'); // day | week | month

    const calc = (rows) => {
        const weekMins = Math.round(rows.reduce((s, r) => s + (r.total || r.mins || 0), 0));
        // Streak days (scan backward for consecutive >0 days)
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
                    <AnimatedCard><div className="stat"><div className="label">Total study time this week</div><div className="value">{fmtM(stats.weekMins)}</div></div></AnimatedCard>
                    <AnimatedCard delay={0.05}><div className="stat"><div className="label">Consecutive study days</div><div className="value">{stats.streak} days</div></div></AnimatedCard>
                </div>

                <AnimatedCard delay={0.1}>
                    {/* Your StudyTimer */}
                    <StudyTimer />
                </AnimatedCard>

                <AnimatedCard delay={0.15}>
                    <div className="label">Study time in last 7 days</div>
                    <Chart7d />
                </AnimatedCard>
                <AnimatedCard delay={0.2}>
                    <div className="label">Study hours heatmap</div>
                    <ChartHeatmap days={30} />
                </AnimatedCard>

                <AnimatedCard delay={0.25}>
                    <div className="hstack" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div className="label">Longer-term trend</div>
                        <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
                            <select className="input" value={String(seriesDays)} onChange={(e) => setSeriesDays(parseInt(e.target.value, 10))}>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="180">180 days</option>
                            </select>
                            <select className="input" value={seriesBucket} onChange={(e) => setSeriesBucket(e.target.value)}>
                                <option value="day">Daily</option>
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <ChartSeries days={seriesDays} bucket={seriesBucket} />
                </AnimatedCard>

                <div className="hstack" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <AnimatedCard delay={0.3} style={{ flex: 1, minWidth: 320 }}>
                        <div className="label">Top courses (last 30 days)</div>
                        <ChartCourseTop days={30} limit={5} />
                    </AnimatedCard>
                    <AnimatedCard delay={0.35} style={{ flex: 1, minWidth: 320 }}>
                        <div className="label">Methods breakdown (last 30 days)</div>
                        <ChartMethodBreakdown days={30} />
                    </AnimatedCard>
                </div>
            </div>
        </PageEnter>
    );
}
function fmtM(m) { const h = Math.floor(m / 60), mm = m % 60; return h ? `${h}h ${mm}m` : `${mm}m`; }
