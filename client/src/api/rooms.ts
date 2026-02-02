import type { Room, CreateRoomInput, UpdateRoomInput } from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export interface RoomWithCount extends Room {
  _count?: { devices: number };
}

export const roomsApi = {
  list: () => get<RoomWithCount[]>('/rooms'),

  get: (id: string) => get<Room>(`/rooms/${id}`),

  create: (data: CreateRoomInput) => post<Room>('/rooms', data),

  update: (id: string, data: UpdateRoomInput) => patch<Room>(`/rooms/${id}`, data),

  delete: (id: string) => del<void>(`/rooms/${id}`),
};
