import type { DeviceCategory, DeviceIcon } from '../types/index.js';

export interface DevicePreset {
  name: string;
  icon: DeviceIcon;
  category: DeviceCategory;
  estimatedWattage: number;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  // Appliances
  { name: 'Dishwasher', icon: 'dishwasher', category: 'appliance', estimatedWattage: 1800 },
  { name: 'Washing Machine', icon: 'washing-machine', category: 'appliance', estimatedWattage: 2200 },
  { name: 'Tumble Dryer', icon: 'dryer', category: 'appliance', estimatedWattage: 2500 },
  { name: 'Oven', icon: 'oven', category: 'appliance', estimatedWattage: 3500 },
  { name: 'Induction Hob', icon: 'oven', category: 'appliance', estimatedWattage: 7200 },
  { name: 'Fridge', icon: 'fridge', category: 'appliance', estimatedWattage: 150 },
  { name: 'Freezer', icon: 'freezer', category: 'appliance', estimatedWattage: 200 },
  { name: 'Fridge/Freezer Combo', icon: 'fridge', category: 'appliance', estimatedWattage: 250 },
  { name: 'Microwave', icon: 'microwave', category: 'appliance', estimatedWattage: 1200 },
  { name: 'Range Hood', icon: 'hood', category: 'appliance', estimatedWattage: 200 },

  // Lighting
  { name: 'Ceiling Light', icon: 'ceiling-light', category: 'lighting', estimatedWattage: 60 },
  { name: 'LED Downlights', icon: 'ceiling-light', category: 'lighting', estimatedWattage: 50 },
  { name: 'Floor Lamp', icon: 'lamp', category: 'lighting', estimatedWattage: 40 },
  { name: 'Table Lamp', icon: 'lamp', category: 'lighting', estimatedWattage: 25 },
  { name: 'LED Strip', icon: 'led-strip', category: 'lighting', estimatedWattage: 30 },
  { name: 'Outdoor Light', icon: 'outdoor-light', category: 'lighting', estimatedWattage: 50 },
  { name: 'Garden Lighting', icon: 'outdoor-light', category: 'lighting', estimatedWattage: 100 },

  // Outlets
  { name: 'Wall Outlet', icon: 'wall-outlet', category: 'outlet', estimatedWattage: 0 },
  { name: 'Kitchen Outlet', icon: 'kitchen-outlet', category: 'outlet', estimatedWattage: 0 },
  { name: 'Bathroom Outlet', icon: 'wall-outlet', category: 'outlet', estimatedWattage: 0 },
  { name: 'Outdoor Outlet', icon: 'wall-outlet', category: 'outlet', estimatedWattage: 0 },

  // Heating
  { name: 'Floor Heating', icon: 'floor-heating', category: 'heating', estimatedWattage: 1500 },
  { name: 'Electric Radiator', icon: 'radiator', category: 'heating', estimatedWattage: 1000 },
  { name: 'Water Heater', icon: 'water-heater', category: 'heating', estimatedWattage: 2000 },
  { name: 'Heat Pump', icon: 'heat-pump', category: 'heating', estimatedWattage: 1500 },
  { name: 'Towel Warmer', icon: 'radiator', category: 'heating', estimatedWattage: 100 },

  // Other
  { name: 'EV Charger', icon: 'ev-charger', category: 'other', estimatedWattage: 7400 },
  { name: 'Alarm System', icon: 'alarm', category: 'other', estimatedWattage: 50 },
  { name: 'Router', icon: 'router', category: 'other', estimatedWattage: 20 },
  { name: 'NAS/Server', icon: 'server', category: 'other', estimatedWattage: 100 },
  { name: 'TV', icon: 'tv', category: 'other', estimatedWattage: 150 },
  { name: 'Computer', icon: 'computer', category: 'other', estimatedWattage: 300 },
  { name: 'Gaming PC', icon: 'computer', category: 'other', estimatedWattage: 600 },
];

export const DEVICE_CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'appliance', label: 'Appliances' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'outlet', label: 'Outlets' },
  { value: 'heating', label: 'Heating' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_ICONS: Record<DeviceCategory, string> = {
  appliance: 'Refrigerator',
  lighting: 'Lightbulb',
  outlet: 'Plug',
  heating: 'Flame',
  other: 'MoreHorizontal',
};

// Sub-Panel Feed Amperage Options
export const SUB_PANEL_FEED_OPTIONS = [
  { value: 20, label: '20A Sub-Panel Feed' },
  { value: 30, label: '30A Sub-Panel Feed' },
  { value: 40, label: '40A Sub-Panel Feed' },
  { value: 60, label: '60A Sub-Panel Feed' },
  { value: 80, label: '80A Sub-Panel Feed' },
  { value: 100, label: '100A Sub-Panel Feed' },
  { value: 125, label: '125A Sub-Panel Feed' },
  { value: 150, label: '150A Sub-Panel Feed' },
  { value: 200, label: '200A Sub-Panel Feed' },
];
