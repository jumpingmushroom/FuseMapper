import type {
  RowWithFuses,
  CreateRowInput,
  UpdateRowInput,
  ReorderRowInput,
} from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export const rowsApi = {
  create: (panelId: string, data: Omit<CreateRowInput, 'panelId'>) =>
    post<RowWithFuses>(`/panels/${panelId}/rows`, data),

  get: (id: string) =>
    get<RowWithFuses>(`/rows/${id}`),

  update: (id: string, data: UpdateRowInput) =>
    patch<RowWithFuses>(`/rows/${id}`, data),

  reorder: (id: string, data: ReorderRowInput) =>
    patch<RowWithFuses>(`/rows/${id}/reorder`, data),

  delete: (id: string) => del<void>(`/rows/${id}`),
};
