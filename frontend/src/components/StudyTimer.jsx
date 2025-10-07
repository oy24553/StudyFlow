import { useEffect, useRef, useState } from 'react';
import client from '../api/client';

export default function StudyTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const start = () => {
    startRef.current = new Date();
    setSeconds(0);
    setRunning(true);
  };

  const stop = async () => {
    if (!running || !startRef.current) return;
    setRunning(false);
    setSaving(true);
    const payload = {
      startAt: startRef.current.toISOString(),
      endAt: new Date().toISOString(),
      method: 'deep',
      notes: ''
      // 如需课程：添加 courseId: '...'（前端传入或选择器选择）
    };
    try {
      await client.post('/study-sessions', payload);
      setLastSavedAt(new Date());
      // 通知全局刷新（仪表盘图表、学习列表等可监听这个事件）
      window.dispatchEvent(new Event('study-updated'));
    } catch (e) {
      console.error(e);
      alert('保存失败，请检查后端 /study-sessions 接口与网络。');
    } finally {
      setSaving(false);
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="card" aria-live="polite">
      <div className="hstack" style={{ justifyContent: 'space-between' }}>
        <div className="vstack">
          <div className="label">学习计时</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{mm}:{ss}</div>
          {lastSavedAt && (
            <div className="label">已保存于 {lastSavedAt.toLocaleString()}</div>
          )}
        </div>
        <div className="hstack" style={{ gap: 8 }}>
          {!running ? (
            <button className="btn" onClick={start} aria-label="开始学习">开始学习</button>
          ) : (
            <button className="btn" onClick={stop} disabled={saving} aria-label="结束并保存">
              {saving ? '保存中…' : '结束并保存'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
