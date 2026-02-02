import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { DEVICE_PRESETS, DEVICE_CATEGORIES, type DevicePreset } from '@fusemapper/shared';
import { Card, Input } from '@/components/ui';
import { useUnassignedDevices } from '@/hooks';
import { DeviceCard } from './DeviceCard';
import { DeviceIcon } from './DeviceIcon';

interface DevicePaletteProps {
  panelId: string;
}

function DraggablePreset({ preset }: { preset: DevicePreset }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `preset-${preset.name}`,
    data: { type: 'preset', preset },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-grab hover:bg-gray-100
        transition-colors select-none ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <DeviceIcon icon={preset.icon} size={18} className="text-gray-500" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{preset.name}</div>
        <div className="text-xs text-gray-500">
          {preset.estimatedWattage > 0 ? `${preset.estimatedWattage}W` : 'Variable'}
        </div>
      </div>
    </div>
  );
}

export function DevicePalette({ panelId }: DevicePaletteProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['appliance', 'lighting'])
  );
  const { data: unassignedDevices } = useUnassignedDevices();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredPresets = search
    ? DEVICE_PRESETS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : DEVICE_PRESETS;

  const presetsByCategory = DEVICE_CATEGORIES.map((cat) => ({
    ...cat,
    presets: filteredPresets.filter((p) => p.category === cat.value),
  })).filter((cat) => cat.presets.length > 0);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Unassigned Devices */}
      {unassignedDevices && unassignedDevices.length > 0 && (
        <Card>
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Package size={16} />
              Unassigned Devices ({unassignedDevices.length})
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
            {unassignedDevices.map((device) => (
              <DeviceCard key={device.id} device={device} panelId={panelId} />
            ))}
          </div>
        </Card>
      )}

      {/* Device Presets */}
      <Card>
        <div className="p-3 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-900">
            Device Presets
          </div>
          <div className="text-xs text-gray-500">
            Drag onto a breaker to add
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {presetsByCategory.map((category) => (
            <div key={category.value}>
              <button
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                onClick={() => toggleCategory(category.value)}
              >
                <span className="text-sm font-medium text-gray-700">
                  {category.label}
                </span>
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">{category.presets.length}</span>
                  {expandedCategories.has(category.value) ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </span>
              </button>
              {expandedCategories.has(category.value) && (
                <div className="px-2 pb-2 space-y-1">
                  {category.presets.map((preset) => (
                    <DraggablePreset key={preset.name} preset={preset} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
