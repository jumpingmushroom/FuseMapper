import type {
  PanelWithFuses,
  CreatePanelInput,
  UpdatePanelInput,
} from '@fusemapper/shared';
import { get, post, patch, del } from './client';

export interface PanelHierarchyItem {
  id: string;
  name: string;
  parentFuseId: string | null;
  feedAmperage: number | null;
}

export const panelsApi = {
  list: () => get<PanelWithFuses[]>('/panels'),

  get: (id: string) => get<PanelWithFuses>(`/panels/${id}`),

  hierarchy: (id: string) => get<PanelHierarchyItem[]>(`/panels/${id}/hierarchy`),

  create: (data: CreatePanelInput) => post<PanelWithFuses>('/panels', data),

  update: (id: string, data: UpdatePanelInput) =>
    patch<PanelWithFuses>(`/panels/${id}`, data),

  delete: (id: string) => del<void>(`/panels/${id}`),
};
