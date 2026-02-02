import type { ExportData, ImportResult } from '@fusemapper/shared';
import { get, post } from './client';

export const exportApi = {
  export: () => get<ExportData>('/export'),

  import: (data: ExportData) => post<ImportResult>('/import', data),
};
