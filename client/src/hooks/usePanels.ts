import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePanelInput, UpdatePanelInput } from '@fusemapper/shared';
import { panelsApi } from '@/api';

export const panelKeys = {
  all: ['panels'] as const,
  lists: () => [...panelKeys.all, 'list'] as const,
  list: () => [...panelKeys.lists()] as const,
  details: () => [...panelKeys.all, 'detail'] as const,
  detail: (id: string) => [...panelKeys.details(), id] as const,
  hierarchies: () => [...panelKeys.all, 'hierarchy'] as const,
  hierarchy: (id: string) => [...panelKeys.hierarchies(), id] as const,
};

export function usePanels() {
  return useQuery({
    queryKey: panelKeys.list(),
    queryFn: panelsApi.list,
  });
}

export function usePanel(id: string) {
  return useQuery({
    queryKey: panelKeys.detail(id),
    queryFn: () => panelsApi.get(id),
    enabled: !!id,
  });
}

export function usePanelHierarchy(id: string) {
  return useQuery({
    queryKey: panelKeys.hierarchy(id),
    queryFn: () => panelsApi.hierarchy(id),
    enabled: !!id,
  });
}

export function useCreatePanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePanelInput) => panelsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useUpdatePanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePanelInput }) =>
      panelsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: panelKeys.detail(id) });
    },
  });
}

export function useDeletePanel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => panelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}
