import type {
  DeviceWithRoom,
  CreateDeviceInput,
  UpdateDeviceInput,
  MoveDeviceInput,
} from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export const devicesApi = {
  list: (options?: { socketId?: string; unassigned?: boolean }) => {
    const params = new URLSearchParams();
    if (options?.socketId) params.set('socketId', options.socketId);
    if (options?.unassigned) params.set('unassigned', 'true');
    const query = params.toString();
    return get<DeviceWithRoom[]>(`/devices${query ? `?${query}` : ''}`);
  },

  create: (data: CreateDeviceInput) => post<DeviceWithRoom>('/devices', data),

  update: (id: string, data: UpdateDeviceInput) =>
    patch<DeviceWithRoom>(`/devices/${id}`, data),

  move: (id: string, data: MoveDeviceInput) =>
    patch<DeviceWithRoom>(`/devices/${id}/move`, data),

  delete: (id: string) => del<void>(`/devices/${id}`),
};
