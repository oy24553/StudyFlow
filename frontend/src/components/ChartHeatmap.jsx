import { useEffect, useState } from 'react';
import { getStudyHeatmap } from '../api/stats';

const DAYS = ['一','二','三','四','五','六','日']; // ISO 周：1..7

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
    setMaxM(Math.max(30, Math.min(120, mx))); // 颜色上限：30~120分钟之间自适应
  };

  useEffect(()=>{ load(); const fn=()=>load(); window.addEventListener('study-updated', fn); return ()=>window.removeEventListener('study-updated', fn); }, [days]);

  return (
    <div className="vstack">
      <div className="label">近 {days} 天学习热力图（深色=该时间段分钟数更多）</div>
      <div className="heat-grid">
        {/* 头部小时标签 */}
        <div></div>
        {Array.from({length:24},(_,h)=><div key={'h'+h} className="heat-hour">{h}</div>)}

        {/* 行：周一..周日 */}
        {grid.map((row, di)=>(
          <>
            <div key={'dlabel'+di} className="heat-day">周{DAYS[di]}</div>
            {row.map((mins, hi)=>{
              const alpha = Math.min(1, mins / maxM); // 0..1
              return <div key={`c${di}-${hi}`} className="heat-cell" style={{'--alpha': alpha, '--hint': `"${mins}m"`}} title={`${mins} 分钟`} />;
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
