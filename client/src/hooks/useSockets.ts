import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateSocketInput, UpdateSocketInput, ReorderSocketInput } from '@fusemapper/shared';
import { socketsApi } from '@/api';
import { panelKeys } from './usePanels';

export function useCreateSocket(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fuseId, data }: { fuseId: string; data: Omit<CreateSocketInput, 'fuseId'> }) =>
      socketsApi.create(fuseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useUpdateSocket(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSocketInput }) =>
      socketsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useReorderSocket(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReorderSocketInput }) =>
      socketsApi.reorder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useDeleteSocket(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => socketsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}
