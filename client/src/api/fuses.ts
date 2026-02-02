import type {
  FuseWithDevices,
  CreateFuseInput,
  UpdateFuseInput,
} from '@fusemapper/shared';
import { post, patch, del } from './client';

export const fusesApi = {
  create: (panelId: string, data: Omit<CreateFuseInput, 'panelId'>) =>
    post<FuseWithDevices>(`/panels/${panelId}/fuses`, data),

  update: (id: string, data: UpdateFuseInput) =>
    patch<FuseWithDevices>(`/fuses/${id}`, data),

  delete: (id: string) => del<void>(`/fuses/${id}`),
};
