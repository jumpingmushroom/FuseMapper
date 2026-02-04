import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateJunctionBoxInput, UpdateJunctionBoxInput, ReorderJunctionBoxInput } from '@fusemapper/shared';
import { junctionBoxesApi } from '@/api/junction-boxes';
import { panelKeys } from './usePanels';

export function useCreateJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fuseId, data }: { fuseId: string; data: Omit<CreateJunctionBoxInput, 'fuseId'> }) =>
      junctionBoxesApi.create(fuseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useUpdateJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJunctionBoxInput }) =>
      junctionBoxesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useReorderJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReorderJunctionBoxInput }) =>
      junctionBoxesApi.reorder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useDeleteJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => junctionBoxesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useCreateSocketOnJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ junctionBoxId, data }: { junctionBoxId: string; data: { label?: string; roomId?: string; notes?: string } }) =>
      junctionBoxesApi.createSocket(junctionBoxId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useCreateDeviceOnJunctionBox(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ junctionBoxId, data }: { junctionBoxId: string; data: { name: string; icon?: string; category?: string; estimatedWattage?: number; roomId?: string; notes?: string } }) =>
      junctionBoxesApi.createDevice(junctionBoxId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}
