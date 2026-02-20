import client from './client';

export async function listMyRooms() {
  const { data } = await client.get('/rooms');
  return data?.data ?? [];
}

export async function createRoom({ name }) {
  const { data } = await client.post('/rooms', { name });
  return data?.data;
}

export async function joinRoomByCode({ inviteCode }) {
  const { data } = await client.post('/rooms/join', { inviteCode });
  return data?.data;
}

export async function getRoom(id) {
  const { data } = await client.get(`/rooms/${id}`);
  return data?.data;
}

