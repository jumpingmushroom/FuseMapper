import { useState, useEffect } from 'react';
import type { DeviceIcon as DeviceIconType, DeviceCategory } from '@fusemapper/shared';
import { DEVICE_CATEGORIES, DEVICE_PRESETS } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useRooms } from '@/hooks';

const ICON_OPTIONS: { value: DeviceIconType; label: string }[] = [
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'washing-machine', label: 'Washing Machine' },
  { value: 'oven', label: 'Oven' },
  { value: 'fridge', label: 'Fridge' },
  { value: 'microwave', label: 'Microwave' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'freezer', label: 'Freezer' },
  { value: 'hood', label: 'Range Hood' },
  { value: 'ceiling-light', label: 'Ceiling Light' },
  { value: 'lamp', label: 'Lamp' },
  { value: 'led-strip', label: 'LED Strip' },
  { value: 'outdoor-light', label: 'Outdoor Light' },
  { value: 'wall-outlet', label: 'Wall Outlet' },
  { value: 'kitchen-outlet', label: 'Kitchen Outlet' },
  { value: 'floor-heating', label: 'Floor Heating' },
  { value: 'water-heater', label: 'Water Heater' },
  { value: 'heat-pump', label: 'Heat Pump' },
  { value: 'radiator', label: 'Radiator' },
  { value: 'ev-charger', label: 'EV Charger' },
  { value: 'alarm', label: 'Alarm' },
  { value: 'router', label: 'Router' },
  { value: 'server', label: 'Server' },
  { value: 'tv', label: 'TV' },
  { value: 'computer', label: 'Computer' },
  { value: 'generic', label: 'Generic' },
];

interface HardwiredDeviceFormData {
  name: string;
  icon: DeviceIconType;
  category: DeviceCategory;
  roomId: string;
  estimatedWattage: number;
  notes: string;
}

interface HardwiredDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HardwiredDeviceFormData) => Promise<void>;
  loading?: boolean;
  fuseLabel: string;
}

export function HardwiredDeviceModal({
  open,
  onClose,
  onSubmit,
  loading,
  fuseLabel,
}: HardwiredDeviceModalProps) {
  const { data: rooms } = useRooms();

  const [formData, setFormData] = useState<HardwiredDeviceFormData>({
    name: '',
    icon: 'generic',
    category: 'other',
    roomId: '',
    estimatedWattage: 0,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        icon: 'generic',
        category: 'other',
        roomId: '',
        estimatedWattage: 0,
        notes: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = DEVICE_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setFormData({
        ...formData,
        name: preset.name,
        icon: preset.icon,
        category: preset.category,
        estimatedWattage: preset.estimatedWattage,
      });
    }
  };

  // Filter presets to show only hardwired and flexible connection types
  const availablePresets = DEVICE_PRESETS.filter(
    (p) => p.connectionType !== 'socket'
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Hardwired Device"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
          <p className="font-medium">
            This device will be hardwired directly to: <strong>{fuseLabel}</strong>
          </p>
          <p className="text-xs mt-1">
            Hardwired devices connect through junction boxes without using sockets.
          </p>
        </div>

        {availablePresets.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availablePresets.slice(0, 8).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handlePresetSelect(preset.name)}
                  className="text-left px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {preset.name}
                  <span className="text-xs text-gray-500 block">{preset.estimatedWattage}W</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Device Name"
          placeholder="Ceiling Light, EV Charger, Floor Heating..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          label="Icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value as DeviceIconType })}
          options={ICON_OPTIONS}
        />

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as DeviceCategory })}
          options={DEVICE_CATEGORIES}
        />

        {rooms && rooms.length > 0 && (
          <Select
            label="Room (optional)"
            value={formData.roomId}
            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
            options={[
              { value: '', label: 'No room' },
              ...rooms.map((room) => ({ value: room.id, label: room.name })),
            ]}
          />
        )}

        <Input
          label="Estimated Wattage"
          type="number"
          min="0"
          max="50000"
          value={formData.estimatedWattage}
          onChange={(e) => setFormData({ ...formData, estimatedWattage: parseInt(e.target.value) || 0 })}
        />

        <Input
          label="Notes (optional)"
          placeholder="Additional information..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Device
          </Button>
        </div>
      </form>
    </Modal>
  );
}
