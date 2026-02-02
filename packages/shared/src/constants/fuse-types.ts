import type { FuseType, CurveType } from '../types/index.js';

export interface FuseTypeInfo {
  value: FuseType;
  label: string;
  description: string;
  defaultSlotWidth: number;
}

export const FUSE_TYPES: FuseTypeInfo[] = [
  {
    value: 'MCB',
    label: 'MCB',
    description: 'Miniature Circuit Breaker',
    defaultSlotWidth: 1
  },
  {
    value: 'RCBO',
    label: 'RCBO',
    description: 'Residual Current Breaker with Overcurrent',
    defaultSlotWidth: 2
  },
  {
    value: 'RCD',
    label: 'RCD',
    description: 'Residual Current Device',
    defaultSlotWidth: 2
  },
  {
    value: 'MAIN',
    label: 'Main',
    description: 'Main Switch/Breaker',
    defaultSlotWidth: 3
  },
  {
    value: 'SPD',
    label: 'SPD',
    description: 'Surge Protection Device',
    defaultSlotWidth: 1
  },
  {
    value: 'DIN_DEVICE',
    label: 'DIN Device',
    description: 'Generic DIN Rail Device',
    defaultSlotWidth: 1
  },
];

export const CURVE_TYPES: { value: CurveType; label: string; description: string }[] = [
  { value: 'B', label: 'B', description: 'General purpose (3-5x In)' },
  { value: 'C', label: 'C', description: 'Motor loads (5-10x In)' },
  { value: 'D', label: 'D', description: 'High inrush (10-20x In)' },
];

export const COMMON_AMPERAGES = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100];

export const FUSE_TYPE_COLORS: Record<FuseType, string> = {
  MCB: '#3B82F6',      // Blue
  RCBO: '#8B5CF6',     // Purple
  RCD: '#EC4899',      // Pink
  MAIN: '#EF4444',     // Red
  SPD: '#F59E0B',      // Amber
  DIN_DEVICE: '#6B7280', // Gray
};

export const DEFAULT_FUSE_VALUES = {
  type: 'MCB' as FuseType,
  curveType: 'C' as CurveType,
  amperage: 16,
  poles: 1,
  isActive: true,
};
