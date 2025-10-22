import { useEffect, useState } from 'react';
import { getStudyHeatmap } from '../api/stats';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; // ISO week: 1..7

export default function ChartHeatmap({ days = 30 }){
  const [grid, setGrid] = useState(Array.from({length:7}, ()=>Array(24).fill(0)));
  const [maxM, setMaxM] = useState(60);

  const load = async () => {
    const to = new Date();
    const from = new Date(); from.setDate(to.getDate() - days);
    const rows = await getStudyHeatmap({ from: from.toISOString(), to: to.toISOString() });
    const g = Array.from({length:7}, ()=>Array(24).fill(0));
    let mx = 0;
    for(const r of rows){
      const d = (r.d-1); // 0..6
      const h = r.h;     // 0..23
      g[d][h] = Math.round(r.mins);
      if (g[d][h] > mx) mx = g[d][h];
    }
    setGrid(g);
    setMaxM(Math.max(30, Math.min(120, mx))); // Color cap: auto between 30~120 minutes
  };

  useEffect(()=>{ load(); const fn=()=>load(); window.addEventListener('study-updated', fn); return ()=>window.removeEventListener('study-updated', fn); }, [days]);

  return (
    <div className="vstack">
      <div className="label">Study heatmap for last {days} days (darker = more minutes in slot)</div>
      <div className="heat-grid">
        {/* Hour labels header */}
        <div></div>
        {Array.from({length:24},(_,h)=><div key={'h'+h} className="heat-hour">{h}</div>)}

        {/* Rows: Monday..Sunday */}
        {grid.map((row, di)=>(
          <>
            <div key={'dlabel'+di} className="heat-day">{DAYS[di]}</div>
            {row.map((mins, hi)=>{
              const alpha = Math.min(1, mins / maxM); // 0..1
              return <div key={`c${di}-${hi}`} className="heat-cell" style={{'--alpha': alpha, '--hint': `"${mins}m"`}} title={`${mins} minutes`} />;
            })}
          </>
        ))}
      </div>

      <div className="heat-legend">
        <span className="label">0m</span>
        <div className="heat-grad"></div>
        <span className="label">{maxM}m+</span>
      </div>
    </div>
  );
}
