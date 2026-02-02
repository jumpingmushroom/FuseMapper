// Panel Types
export interface Panel {
  id: string;
  name: string;
  location: string | null;
  mainBreakerAmperage: number | null;
  mainBreakerType: string | null;
  createdAt: Date;
  updatedAt: Date;
  rows?: Row[];
}

export interface CreatePanelInput {
  name: string;
  location?: string;
  mainBreakerAmperage?: number;
  mainBreakerType?: string;
}

export interface UpdatePanelInput {
  name?: string;
  location?: string;
  mainBreakerAmperage?: number | null;
  mainBreakerType?: string | null;
}

// Row Types
export interface Row {
  id: string;
  panelId: string;
  label: string | null;
  position: number;
  maxFuses: number;
  createdAt: Date;
  updatedAt: Date;
  fuses?: Fuse[];
}

export interface CreateRowInput {
  panelId: string;
  label?: string;
  position?: number;
  maxFuses?: number;
}

export interface UpdateRowInput {
  label?: string | null;
  position?: number;
  maxFuses?: number;
}

export interface ReorderRowInput {
  position: number;
}

// Fuse Types
export type FuseType = 'MCB' | 'RCBO' | 'RCD' | 'MAIN' | 'SPD' | 'DIN_DEVICE';
export type CurveType = 'B' | 'C' | 'D' | null;

export interface Fuse {
  id: string;
  panelId: string;
  rowId: string | null;
  label: string | null;
  sortOrder: number;
  slotNumber: number | null;
  poles: number;
  amperage: number | null;
  type: FuseType;
  curveType: CurveType;
  manufacturer: string | null;
  model: string | null;
  isActive: boolean;
  color: string | null;
  notes: string | null;
  deviceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  sockets?: Socket[];
  row?: Row | null;
}

export interface CreateFuseInput {
  panelId: string;
  rowId?: string;
  label?: string;
  sortOrder?: number;
  slotNumber?: number;
  poles?: number;
  amperage?: number;
  type?: FuseType;
  curveType?: CurveType;
  manufacturer?: string;
  model?: string;
  isActive?: boolean;
  color?: string;
  notes?: string;
  deviceUrl?: string;
}

export interface UpdateFuseInput {
  rowId?: string | null;
  label?: string;
  sortOrder?: number;
  slotNumber?: number | null;
  poles?: number;
  amperage?: number;
  type?: FuseType;
  curveType?: CurveType;
  manufacturer?: string;
  model?: string;
  isActive?: boolean;
  color?: string;
  notes?: string;
  deviceUrl?: string;
}

// Socket Types
export interface Socket {
  id: string;
  fuseId: string;
  label: string | null;
  sortOrder: number;
  roomId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  room?: Room | null;
  devices?: Device[];
}

export interface CreateSocketInput {
  fuseId: string;
  label?: string;
  sortOrder?: number;
  roomId?: string;
  notes?: string;
}

export interface UpdateSocketInput {
  label?: string;
  sortOrder?: number;
  roomId?: string | null;
  notes?: string | null;
}

export interface ReorderSocketInput {
  sortOrder: number;
}

// Device Types
export type DeviceCategory =
  | 'appliance'
  | 'lighting'
  | 'outlet'
  | 'heating'
  | 'other';

export type DeviceIcon =
  | 'dishwasher'
  | 'washing-machine'
  | 'oven'
  | 'fridge'
  | 'microwave'
  | 'dryer'
  | 'freezer'
  | 'hood'
  | 'ceiling-light'
  | 'lamp'
  | 'led-strip'
  | 'outdoor-light'
  | 'wall-outlet'
  | 'kitchen-outlet'
  | 'floor-heating'
  | 'water-heater'
  | 'heat-pump'
  | 'radiator'
  | 'ev-charger'
  | 'alarm'
  | 'router'
  | 'server'
  | 'tv'
  | 'computer'
  | 'generic';

export interface Device {
  id: string;
  socketId: string | null;
  name: string;
  icon: DeviceIcon;
  category: DeviceCategory;
  roomId: string | null;
  estimatedWattage: number | null;
  notes: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  room?: Room | null;
}

export interface CreateDeviceInput {
  socketId?: string;
  name: string;
  icon?: DeviceIcon;
  category?: DeviceCategory;
  roomId?: string;
  estimatedWattage?: number;
  notes?: string;
  sortOrder?: number;
}

export interface UpdateDeviceInput {
  socketId?: string | null;
  name?: string;
  icon?: DeviceIcon;
  category?: DeviceCategory;
  roomId?: string | null;
  estimatedWattage?: number | null;
  notes?: string | null;
  sortOrder?: number;
}

export interface MoveDeviceInput {
  socketId: string | null;
  sortOrder?: number;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomInput {
  name: string;
  color: string;
}

export interface UpdateRoomInput {
  name?: string;
  color?: string;
}

// Panel with relations
export interface SocketWithDevices extends Socket {
  devices: DeviceWithRoom[];
}

export interface FuseWithSockets extends Fuse {
  sockets: SocketWithDevices[];
}

export interface RowWithFuses extends Row {
  fuses: FuseWithSockets[];
}

export interface PanelWithRows extends Panel {
  rows: RowWithFuses[];
  fuses: FuseWithSockets[]; // For unassigned fuses
}

export interface PanelWithFuses extends Panel {
  fuses: FuseWithSockets[];
}

export interface DeviceWithRoom extends Device {
  room: Room | null;
}

// Export/Import Types
export interface ExportData {
  version: string;
  exportedAt: string;
  panels: PanelWithFuses[];
  rooms: Room[];
  unassignedDevices: Device[];
}

export interface ImportResult {
  success: boolean;
  panelsImported: number;
  fusesImported: number;
  socketsImported: number;
  devicesImported: number;
  roomsImported: number;
  errors: string[];
}

// Load Calculation Types
export interface LoadCalculation {
  fuseId: string;
  totalWattage: number;
  maxWattage: number;
  loadPercentage: number;
  status: 'safe' | 'warning' | 'danger';
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
