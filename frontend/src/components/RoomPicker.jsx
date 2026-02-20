import { useEffect, useState } from 'react';
import { listMyRooms } from '../api/rooms';

export default function RoomPicker({ value, onChange, allowNone = true }) {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      setRooms(await listMyRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
      <select
        className="input"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value || null)}
        disabled={loading}
      >
        {allowNone && <option value="">No room</option>}
        {rooms.map((r) => (
          <option key={r._id} value={r._id}>{r.name}</option>
        ))}
      </select>
      <button className="btn" type="button" onClick={load} disabled={loading}>
        {loading ? 'Loading…' : 'Refresh'}
      </button>
    </div>
  );
}

