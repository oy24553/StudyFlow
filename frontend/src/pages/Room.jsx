import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRoom } from '../api/rooms';
import { connectSocket } from '../realtime/socket';

export default function Room() {
  const { id } = useParams();
  const roomId = String(id || '');

  const [info, setInfo] = useState(null);
  const [presence, setPresence] = useState([]);

  const inviteCode = info?.room?.inviteCode || '';
  const title = info?.room?.name || 'Room';

  const memberById = useMemo(() => {
    const map = new Map();
    for (const m of info?.members || []) map.set(String(m.user?.id), m);
    return map;
  }, [info]);

  const load = async () => {
    setInfo(await getRoom(roomId));
  };

  useEffect(() => {
    if (!roomId) return;
    load();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    const s = connectSocket();

    const onPresence = (rows) => setPresence(Array.isArray(rows) ? rows : []);
    s.on('presence', onPresence);

    s.emit('join_room', { roomId }, (ack) => {
      if (!ack?.ok) {
        // eslint-disable-next-line no-alert
        alert(ack?.error || 'Failed to join room');
      }
    });

    return () => {
      s.emit('leave_room', { roomId });
      s.off('presence', onPresence);
    };
  }, [roomId]);

  const setMyStatus = (status) => {
    const s = connectSocket();
    s.emit('status_update', { roomId, status });
  };

  return (
    <div className="vstack">
      <div className="card vstack">
        <div className="hstack" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className="vstack" style={{ gap: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
            <div className="label">Invite code: <code>{inviteCode}</code></div>
          </div>
          <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setMyStatus('idle')}>I’m idle</button>
            <button className="btn btn-primary" onClick={() => setMyStatus('focus')}>I’m focusing</button>
            <button className="btn" onClick={() => setMyStatus('break')}>I’m on break</button>
          </div>
        </div>
      </div>

      <div className="card vstack">
        <div className="label">Online status (real-time)</div>
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Remaining</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {presence.map((p) => {
              const m = memberById.get(String(p.userId));
              const name = m?.user?.name || p.name || '';
              const email = m?.user?.email || p.email || '';
              const label = name ? `${name}${email ? ` (${email})` : ''}` : (email || p.userId);
              return (
                <tr key={p.userId}>
                  <td>{label}</td>
                  <td>{m?.role || '-'}</td>
                  <td><StatusPill status={p.status} /></td>
                  <td>{Number.isFinite(p.remainSec) ? fmtRemain(p.remainSec) : '-'}</td>
                  <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString() : '-'}</td>
                </tr>
              );
            })}
            {!presence.length && (
              <tr>
                <td colSpan="5">No one online yet</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="label">Note: presence is in-memory; if the server restarts it resets.</div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const s = status || 'idle';
  const bg = s === 'focus' ? 'rgba(99,102,241,.14)' : s === 'break' ? 'rgba(16,185,129,.14)' : 'rgba(148,163,184,.16)';
  const fg = s === 'focus' ? '#4f46e5' : s === 'break' ? '#059669' : '#64748b';
  const text = s === 'focus' ? 'Focusing' : s === 'break' ? 'Break' : 'Idle';
  return <span style={{ padding: '4px 10px', borderRadius: 999, background: bg, color: fg, fontSize: 12, fontWeight: 700 }}>{text}</span>;
}

function fmtRemain(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

