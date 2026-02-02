import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRowInput, UpdateRowInput, ReorderRowInput } from '@fusemapper/shared';
import { rowsApi } from '@/api/rows';

export function useCreateRow(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CreateRowInput, 'panelId'>) =>
      rowsApi.create(panelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', panelId] });
    },
  });
}

export function useUpdateRow(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRowInput }) =>
      rowsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', panelId] });
    },
  });
}

export function useReorderRow(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReorderRowInput }) =>
      rowsApi.reorder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', panelId] });
    },
  });
}

export function useDeleteRow(panelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rowsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel', panelId] });
    },
  });
}
