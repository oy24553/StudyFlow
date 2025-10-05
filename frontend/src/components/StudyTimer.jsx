import { useEffect, useRef, useState } from 'react';
import client from '../api/client';


export default function StudyTimer() {
    const [running, setRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const startRef = useRef(null);


    useEffect(() => {
        let id; if (running) { id = setInterval(() => setSeconds(s => s + 1), 1000); }
        return () => clearInterval(id);
    }, [running]);


    const start = () => { startRef.current = new Date(); setSeconds(0); setRunning(true); };
    const stop = async () => {
        setRunning(false);
        const payload = { startAt: startRef.current.toISOString(), endAt: new Date().toISOString(), method: 'deep' };
        try { await client.post('/study-sessions', payload); alert('学习会话已保存'); }
        catch (e) { console.error(e); alert('保存失败'); }
    };


    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');


    return (
        <div className="card hstack" style={{ justifyContent: 'space-between' }}>
            <div className="vstack">
                <div className="label">学习计时</div>
                <div style={{ fontSize: 26, fontWeight: 700 }}>{mm}:{ss}</div>
            </div>
            <div className="hstack" style={{ gap: 8 }}>
                {!running ? <button className="btn" onClick={start}>开始学习</button>
                    : <button className="btn" onClick={stop}>结束并保存</button>}
            </div>
        </div>
    );
}