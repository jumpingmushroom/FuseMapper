import type {
  JunctionBoxWithSockets,
  CreateJunctionBoxInput,
  UpdateJunctionBoxInput,
  ReorderJunctionBoxInput,
  SocketWithDevices,
  DeviceWithRoom,
} from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export const junctionBoxesApi = {
  create: (fuseId: string, data: Omit<CreateJunctionBoxInput, 'fuseId'>) =>
    post<JunctionBoxWithSockets>(`/fuses/${fuseId}/junction-boxes`, data),

  get: (id: string) =>
    get<JunctionBoxWithSockets>(`/junction-boxes/${id}`),

  update: (id: string, data: UpdateJunctionBoxInput) =>
    patch<JunctionBoxWithSockets>(`/junction-boxes/${id}`, data),

  reorder: (id: string, data: ReorderJunctionBoxInput) =>
    patch<JunctionBoxWithSockets>(`/junction-boxes/${id}/reorder`, data),

  delete: (id: string) => del<void>(`/junction-boxes/${id}`),

  createSocket: (junctionBoxId: string, data: { label?: string; roomId?: string; notes?: string }) =>
    post<SocketWithDevices>(`/junction-boxes/${junctionBoxId}/sockets`, data),

  createDevice: (junctionBoxId: string, data: { name: string; icon?: string; category?: string; estimatedWattage?: number; roomId?: string; notes?: string }) =>
    post<DeviceWithRoom>(`/junction-boxes/${junctionBoxId}/devices`, data),
};
