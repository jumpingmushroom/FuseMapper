import type { Device, LoadCalculation, SocketWithDevices, JunctionBoxWithSockets } from '../types/index.js';

// Norwegian standard voltage
export const VOLTAGE = 230;

export interface LoadCalculatorOptions {
  fuseId: string;
  amperage: number | null;
  sockets: SocketWithDevices[];
  junctionBoxes?: JunctionBoxWithSockets[];
  hardwiredDevices?: Device[];
}

export function calculateLoad(options: LoadCalculatorOptions): LoadCalculation {
  const { fuseId, amperage, sockets, junctionBoxes, hardwiredDevices } = options;

  // Sum wattage from all devices across all sockets
  const socketWattage = sockets.reduce((sum, socket) => {
    return sum + socket.devices.reduce((socketSum, device) => {
      return socketSum + (device.estimatedWattage ?? 0);
    }, 0);
  }, 0);

  // Sum wattage from junction boxes (including their sockets and devices)
  const junctionBoxWattage = (junctionBoxes || []).reduce((sum, junctionBox) => {
    // Add wattage from devices directly on the junction box
    const jbDeviceWattage = junctionBox.devices.reduce((jbSum, device) => {
      return jbSum + (device.estimatedWattage ?? 0);
    }, 0);

    // Add wattage from sockets connected to the junction box
    const jbSocketWattage = junctionBox.sockets.reduce((socketSum, socket) => {
      return socketSum + socket.devices.reduce((deviceSum, device) => {
        return deviceSum + (device.estimatedWattage ?? 0);
      }, 0);
    }, 0);

    return sum + jbDeviceWattage + jbSocketWattage;
  }, 0);

  // Sum wattage from hardwired devices
  const hardwiredWattage = (hardwiredDevices || []).reduce((sum, device) => {
    return sum + (device.estimatedWattage ?? 0);
  }, 0);

  const totalWattage = socketWattage + junctionBoxWattage + hardwiredWattage;
  const maxWattage = amperage ? amperage * VOLTAGE : 0;
  const loadPercentage = maxWattage > 0 ? (totalWattage / maxWattage) * 100 : 0;

  let status: LoadCalculation['status'];
  if (loadPercentage < 70) {
    status = 'safe';
  } else if (loadPercentage < 90) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  return {
    fuseId,
    totalWattage,
    maxWattage,
    loadPercentage,
    status,
  };
}

// Helper to calculate load from a flat array of devices (for backward compatibility)
export interface LegacyLoadCalculatorOptions {
  fuseId: string;
  amperage: number | null;
  devices: Device[];
}

export function calculateLoadFromDevices(options: LegacyLoadCalculatorOptions): LoadCalculation {
  const { fuseId, amperage, devices } = options;

  const totalWattage = devices.reduce((sum, device) => {
    return sum + (device.estimatedWattage ?? 0);
  }, 0);

  const maxWattage = amperage ? amperage * VOLTAGE : 0;
  const loadPercentage = maxWattage > 0 ? (totalWattage / maxWattage) * 100 : 0;

  let status: LoadCalculation['status'];
  if (loadPercentage < 70) {
    status = 'safe';
  } else if (loadPercentage < 90) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  return {
    fuseId,
    totalWattage,
    maxWattage,
    loadPercentage,
    status,
  };
}

export function getLoadStatusColor(status: LoadCalculation['status']): string {
  switch (status) {
    case 'safe':
      return '#22C55E'; // Green
    case 'warning':
      return '#EAB308'; // Yellow
    case 'danger':
      return '#EF4444'; // Red
    default:
      return '#6B7280'; // Gray
  }
}

export function formatWattage(wattage: number): string {
  if (wattage >= 1000) {
    return `${(wattage / 1000).toFixed(1)}kW`;
  }
  return `${wattage}W`;
}

export function formatLoadPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
