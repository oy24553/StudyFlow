require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Demo user seed (for one‑click login during review)
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const RoomMember = require('./models/RoomMember');

async function ensureDemoUser() {
  try {
    const email = process.env.DEMO_EMAIL || 'demo@demo.com';
    const name = process.env.DEMO_NAME || 'Demo User';
    const raw = process.env.DEMO_PASSWORD || '123456';
    let u = await User.findOne({ email });
    if (!u) {
      const passwordHash = await bcrypt.hash(raw, 10);
      u = await User.create({ email, passwordHash, name });
      console.log(`✅ Seeded demo user: ${email}`);
    } else {
      console.log(`ℹ️ Demo user exists: ${email}`);
    }
  } catch (e) {
    console.error('⚠️ Failed to ensure demo user', e);
  }
}

const port = process.env.PORT || 4000;

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await ensureDemoUser();

  const server = http.createServer(app);

  const origins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: origins.length ? origins : true,
      credentials: true,
    },
  });

  // In-memory presence/status per room (single instance only)
  // roomId -> userId -> { name, email, status, phase, remainSec, updatedAt }
  const presence = new Map();

  function upsertPresence(roomId, userId, patch) {
    const rid = String(roomId);
    const uid = String(userId);
    if (!presence.has(rid)) presence.set(rid, new Map());
    const bucket = presence.get(rid);
    const prev = bucket.get(uid) || {};
    bucket.set(uid, { ...prev, ...patch, updatedAt: new Date().toISOString() });
  }

  function removePresenceBySocket(socket) {
    const { user } = socket.data || {};
    if (!user?.id) return;
    for (const rid of socket.rooms) {
      if (!rid.startsWith('room:')) continue;
      const roomId = rid.slice('room:'.length);
      const bucket = presence.get(roomId);
      if (!bucket) continue;
      bucket.delete(String(user.id));
      if (!bucket.size) presence.delete(roomId);
      io.to(rid).emit('presence', serializePresence(roomId));
    }
  }

  function serializePresence(roomId) {
    const bucket = presence.get(String(roomId));
    if (!bucket) return [];
    return [...bucket.entries()].map(([userId, v]) => ({
      userId,
      name: v.name || '',
      email: v.email || '',
      status: v.status || 'idle', // idle | focus | break
      phase: v.phase || '',
      remainSec: Number.isFinite(v.remainSec) ? v.remainSec : null,
      updatedAt: v.updatedAt,
    }));
  }

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization || '').replace(/^Bearer\s+/i, '');
      if (!token) return next(new Error('Unauthorized'));
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = user;
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('ready', { ok: true });

    socket.on('join_room', async ({ roomId } = {}, ack) => {
      try {
        const rid = String(roomId || '');
        if (!rid) return ack?.({ ok: false, error: 'roomId required' });
        const isMember = await RoomMember.exists({ roomId: rid, userId: socket.data.user.id });
        if (!isMember) return ack?.({ ok: false, error: 'Forbidden' });

        const roomKey = `room:${rid}`;
        socket.join(roomKey);
        upsertPresence(rid, socket.data.user.id, {
          name: socket.data.user.name || '',
          email: socket.data.user.email || '',
          status: 'idle',
        });
        io.to(roomKey).emit('presence', serializePresence(rid));
        ack?.({ ok: true });
      } catch (e) {
        console.error(e);
        ack?.({ ok: false, error: 'Join failed' });
      }
    });

    socket.on('leave_room', ({ roomId } = {}, ack) => {
      const rid = String(roomId || '');
      if (!rid) return ack?.({ ok: false, error: 'roomId required' });
      const roomKey = `room:${rid}`;
      socket.leave(roomKey);
      const bucket = presence.get(rid);
      if (bucket) {
        bucket.delete(String(socket.data.user.id));
        if (!bucket.size) presence.delete(rid);
      }
      io.to(roomKey).emit('presence', serializePresence(rid));
      ack?.({ ok: true });
    });

    socket.on('status_update', ({ roomId, status, phase, remainSec } = {}, ack) => {
      const rid = String(roomId || '');
      if (!rid) return ack?.({ ok: false, error: 'roomId required' });
      const roomKey = `room:${rid}`;
      if (!socket.rooms.has(roomKey)) return ack?.({ ok: false, error: 'Not in room' });

      const safeStatus = ['idle', 'focus', 'break'].includes(status) ? status : 'idle';
      upsertPresence(rid, socket.data.user.id, {
        status: safeStatus,
        phase: String(phase || ''),
        remainSec: Number.isFinite(+remainSec) ? +remainSec : null,
      });
      io.to(roomKey).emit('presence', serializePresence(rid));
      ack?.({ ok: true });
    });

    socket.on('disconnect', () => removePresenceBySocket(socket));
  });

  server.listen(port, () => console.log(`🚀 API on http://localhost:${port}`));
})();
