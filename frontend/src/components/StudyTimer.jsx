import { useEffect, useRef, useState } from 'react';
import client from '../api/client';
import CoursePicker from './CoursePicker';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function StudyTimer(){
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef(null);

  const [courseId, setCourseId] = useState('');
  const [method, setMethod] = useState('deep');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let id;
    if (running) id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    startRef.current = new Date();
    setSeconds(0);
    setRunning(true);
  };

  const stop = async () => {
    setRunning(false);
    const payload = {
      startAt: startRef.current.toISOString(),
      endAt: new Date().toISOString(),
      method,
      notes: notes.trim() || '',
      courseId: courseId || null,
    };
    try {
      await client.post('/study-sessions', payload);
      window.dispatchEvent(new Event('study-updated'));
      // ✨ 保存成功动画
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.2 } });
      setNotes('');
      alert('学习会话已保存');
    } catch (e) {
      console.error(e);
      alert('保存失败');
    }
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="card vstack" style={{ gap: 12 }}>
      <div className="hstack" style={{ gap: 12, flexWrap: 'wrap' }}>
        <label className="vstack" style={{ minWidth: 220 }}>
          <span className="label">课程</span>
          <CoursePicker value={courseId} onChange={setCourseId} allowNone />
        </label>
        <label className="vstack">
          <span className="label">方式</span>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="deep">deep</option>
            <option value="pomodoro">pomodoro</option>
            <option value="review">review</option>
          </select>
        </label>
        <label className="vstack" style={{ flex: 1, minWidth: 240 }}>
          <span className="label">备注</span>
          <input
            className="input"
            placeholder="学习要点 / 反思（可选）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      <div className="hstack" style={{ justifyContent: 'space-between' }}>
        <div className="vstack">
          <span className="label">学习计时</span>

          {/* ⬇️ 这里替换为带动效的时间 + 红点 */}
          <div className="hstack" style={{ gap: 8, alignItems: 'center' }}>
            <span className={`rec-dot ${running ? 'on' : ''}`} />
            <motion.div
              key={seconds}                          // 每秒触发一次入场动画
              className="timer"
              initial={{ scale: 0.96, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              {mm}:{ss}
            </motion.div>
          </div>
        </div>

        <div className="hstack" style={{ gap: 8 }}>
          {!running ? (
            <button className="btn btn-primary" onClick={start}>开始学习</button>
          ) : (
            <button className="btn btn-primary" onClick={stop}>结束并保存</button>
          )}
        </div>
      </div>
    </div>
  );
}
