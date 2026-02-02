import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateDeviceInput,
  UpdateDeviceInput,
  MoveDeviceInput,
} from '@fusemapper/shared';
import { devicesApi } from '@/api';
import { panelKeys } from './usePanels';

export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (options?: { socketId?: string; unassigned?: boolean }) =>
    [...deviceKeys.lists(), options] as const,
  unassigned: () => [...deviceKeys.lists(), { unassigned: true }] as const,
};

export function useDevices(options?: { socketId?: string; unassigned?: boolean }) {
  return useQuery({
    queryKey: deviceKeys.list(options),
    queryFn: () => devicesApi.list(options),
  });
}

export function useUnassignedDevices() {
  return useDevices({ unassigned: true });
}

export function useCreateDevice(panelId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeviceInput) => devicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      if (panelId) {
        queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      }
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useUpdateDevice(panelId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeviceInput }) =>
      devicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      if (panelId) {
        queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      }
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useMoveDevice(panelId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveDeviceInput }) =>
      devicesApi.move(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      if (panelId) {
        queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      }
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}

export function useDeleteDevice(panelId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => devicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      if (panelId) {
        queryClient.invalidateQueries({ queryKey: panelKeys.detail(panelId) });
      }
      queryClient.invalidateQueries({ queryKey: panelKeys.lists() });
    },
  });
}
