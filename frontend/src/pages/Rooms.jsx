import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createRoom, joinRoomByCode, listMyRooms } from '../api/rooms';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

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

  const onCreate = async () => {
    const n = name.trim();
    if (!n) return;
    const r = await createRoom({ name: n });
    setName('');
    await load();
    if (r?._id) window.location.href = `/rooms/${r._id}`;
  };

  const onJoin = async () => {
    const c = code.trim();
    if (!c) return;
    const r = await joinRoomByCode({ inviteCode: c });
    setCode('');
    await load();
    if (r?._id) window.location.href = `/rooms/${r._id}`;
  };

  return (
    <div className="vstack">
      <div className="card vstack">
        <div className="label">Create a room</div>
        <div className="hstack" style={{ flexWrap: 'wrap' }}>
          <input className="input" placeholder="Room name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-primary" onClick={onCreate}>Create</button>
        </div>
      </div>

      <div className="card vstack">
        <div className="label">Join with invite code</div>
        <div className="hstack" style={{ flexWrap: 'wrap' }}>
          <input className="input" placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn" onClick={onJoin}>Join</button>
        </div>
      </div>

      <div className="card vstack">
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div className="label">My rooms</div>
          <button className="btn" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Invite</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.role}</td>
                <td><code>{r.inviteCode}</code></td>
                <td><Link to={`/rooms/${r._id}`}>Open</Link></td>
              </tr>
            ))}
            {!rooms.length && (
              <tr>
                <td colSpan="4">No rooms yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

