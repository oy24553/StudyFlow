const { Schema, model, Types } = require('mongoose');

const roomMemberSchema = new Schema(
  {
    roomId: { type: Types.ObjectId, ref: 'Room', index: true, required: true },
    userId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
  },
  { timestamps: true }
);

roomMemberSchema.index({ roomId: 1, userId: 1 }, { unique: true });

module.exports = model('RoomMember', roomMemberSchema);

