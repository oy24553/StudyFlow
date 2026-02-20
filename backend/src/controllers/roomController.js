const crypto = require('crypto');
const Room = require('../models/Room');
const RoomMember = require('../models/RoomMember');
const asyncHandler = require('../utils/asyncHandler');

function newInviteCode() {
  // 8 chars URL-safe-ish (base64url)
  return crypto.randomBytes(6).toString('base64url');
}

async function ensureUniqueInviteCode() {
  for (let i = 0; i < 5; i++) {
    const code = newInviteCode();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Room.findOne({ inviteCode: code }).select('_id').lean();
    if (!exists) return code;
  }
  // Fallback: longer code
  return crypto.randomBytes(10).toString('base64url');
}

exports.listMine = asyncHandler(async (req, res) => {
  const memberships = await RoomMember.find({ userId: req.user.id })
    .select('roomId role createdAt')
    .lean();
  const roomIds = memberships.map((m) => m.roomId);
  const rooms = await Room.find({ _id: { $in: roomIds } })
    .select('_id name inviteCode ownerId createdAt')
    .lean();
  const roleByRoom = new Map(memberships.map((m) => [String(m.roomId), m.role]));

  res.json({
    data: rooms
      .map((r) => ({ ...r, role: roleByRoom.get(String(r._id)) || 'member' }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  });
});

exports.create = asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Room name required' });

  const inviteCode = await ensureUniqueInviteCode();
  const room = await Room.create({ name, ownerId: req.user.id, inviteCode });
  await RoomMember.create({ roomId: room._id, userId: req.user.id, role: 'owner' });

  res.status(201).json({ data: room });
});

exports.joinByCode = asyncHandler(async (req, res) => {
  const code = String(req.body?.inviteCode || '').trim();
  if (!code) return res.status(400).json({ error: 'Invite code required' });

  const room = await Room.findOne({ inviteCode: code });
  if (!room) return res.status(404).json({ error: 'Invalid invite code' });

  await RoomMember.updateOne(
    { roomId: room._id, userId: req.user.id },
    { $setOnInsert: { role: room.ownerId.equals(req.user.id) ? 'owner' : 'member' } },
    { upsert: true }
  );

  res.json({ data: room });
});

exports.get = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).lean();
  if (!room) return res.status(404).json({ error: 'Not found' });

  const isMember = await RoomMember.exists({ roomId: room._id, userId: req.user.id });
  if (!isMember) return res.status(403).json({ error: 'Forbidden' });

  const members = await RoomMember.find({ roomId: room._id })
    .populate('userId', 'email name')
    .select('userId role createdAt')
    .lean();

  res.json({
    data: {
      room,
      members: members.map((m) => ({
        role: m.role,
        joinedAt: m.createdAt,
        user: {
          id: m.userId?._id,
          email: m.userId?.email,
          name: m.userId?.name || '',
        },
      })),
    },
  });
});

