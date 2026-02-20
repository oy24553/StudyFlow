const { Schema, model, Types } = require('mongoose');

const roomSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: 'User', index: true, required: true },
    name: { type: String, required: true },
    inviteCode: { type: String, unique: true, index: true, required: true },
  },
  { timestamps: true }
);

module.exports = model('Room', roomSchema);

