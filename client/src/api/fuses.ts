import type {
  FuseWithSockets,
  CreateFuseInput,
  UpdateFuseInput,
  CreateSubPanelInput,
  PanelWithRows,
} from '@fusemapper/shared';
import { post, patch, del } from './client';

export const fusesApi = {
  create: (panelId: string, data: Omit<CreateFuseInput, 'panelId'>) =>
    post<FuseWithSockets>(`/panels/${panelId}/fuses`, data),

  update: (id: string, data: UpdateFuseInput) =>
    patch<FuseWithSockets>(`/fuses/${id}`, data),

  reorder: (id: string, sortOrder: number) =>
    patch<FuseWithSockets>(`/fuses/${id}/reorder`, { sortOrder }),

  delete: (id: string) => del<void>(`/fuses/${id}`),

  createSubPanel: (fuseId: string, data: Omit<CreateSubPanelInput, 'fuseId'>) =>
    post<PanelWithRows>(`/fuses/${fuseId}/subpanel`, data),
};
