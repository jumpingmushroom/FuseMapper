import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateFuseInput, UpdateFuseInput, CreateSubPanelInput } from '@fusemapper/shared';
import { fusesApi } from '@/api';
import { panelKeys } from './usePanels';

export function useCreateFuse(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateFuseInput, 'panelId'>) =>
      fusesApi.create(panelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useUpdateFuse(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFuseInput }) =>
      fusesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useDeleteFuse(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fusesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useCreateSubPanel(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fuseId, data }: { fuseId: string; data: Omit<CreateSubPanelInput, 'fuseId'> }) =>
      fusesApi.createSubPanel(fuseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}
