import {
  Refrigerator,
  WashingMachine,
  CookingPot,
  Microwave,
  Wind,
  Lightbulb,
  Lamp,
  Sun,
  Plug,
  Flame,
  Droplets,
  Thermometer,
  Car,
  Bell,
  Wifi,
  Server,
  Tv,
  Monitor,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { DeviceIcon as DeviceIconType } from '@fusemapper/shared';

const iconMap: Record<DeviceIconType, LucideIcon> = {
  dishwasher: WashingMachine,
  'washing-machine': WashingMachine,
  oven: CookingPot,
  fridge: Refrigerator,
  microwave: Microwave,
  dryer: Wind,
  freezer: Refrigerator,
  hood: Wind,
  'ceiling-light': Lightbulb,
  lamp: Lamp,
  'led-strip': Lightbulb,
  'outdoor-light': Sun,
  'wall-outlet': Plug,
  'kitchen-outlet': Plug,
  'floor-heating': Flame,
  'water-heater': Droplets,
  'heat-pump': Thermometer,
  radiator: Flame,
  'ev-charger': Car,
  alarm: Bell,
  router: Wifi,
  server: Server,
  tv: Tv,
  computer: Monitor,
  generic: Package,
};

interface DeviceIconProps {
  icon: DeviceIconType | string;
  size?: number;
  className?: string;
}

export function DeviceIcon({ icon, size = 16, className = '' }: DeviceIconProps) {
  const IconComponent = iconMap[icon as DeviceIconType] || Package;
  return <IconComponent size={size} className={className} />;
}
