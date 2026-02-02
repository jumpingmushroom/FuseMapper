import type {
  SocketWithDevices,
  CreateSocketInput,
  UpdateSocketInput,
  ReorderSocketInput,
} from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export const socketsApi = {
  create: (fuseId: string, data: Omit<CreateSocketInput, 'fuseId'>) =>
    post<SocketWithDevices>(`/fuses/${fuseId}/sockets`, data),

  get: (id: string) =>
    get<SocketWithDevices>(`/sockets/${id}`),

  update: (id: string, data: UpdateSocketInput) =>
    patch<SocketWithDevices>(`/sockets/${id}`, data),

  reorder: (id: string, data: ReorderSocketInput) =>
    patch<SocketWithDevices>(`/sockets/${id}/reorder`, data),

  delete: (id: string) => del<void>(`/sockets/${id}`),
};
