import { useState, useEffect } from 'react';
import type { Panel } from '@fusemapper/shared';
import { FUSE_TYPE_COLORS, CURVE_TYPES, COMMON_AMPERAGES } from '@fusemapper/shared';
import { Zap, Settings } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useUpdatePanel } from '@/hooks';

interface MainBreakerNodeProps {
  panel: Panel;
}

export function MainBreakerNode({ panel }: MainBreakerNodeProps) {
  const updatePanel = useUpdatePanel();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    mainBreakerAmperage: panel.mainBreakerAmperage || 63,
    mainBreakerType: panel.mainBreakerType || 'MAIN',
    mainBreakerPoles: panel.mainBreakerPoles || 2,
    mainBreakerCurveType: panel.mainBreakerCurveType || '',
    mainBreakerManufacturer: panel.mainBreakerManufacturer || '',
    mainBreakerModel: panel.mainBreakerModel || '',
    mainBreakerNotes: panel.mainBreakerNotes || '',
    mainBreakerDeviceUrl: panel.mainBreakerDeviceUrl || '',
    mainBreakerColor: panel.mainBreakerColor || '',
    mainBreakerIsActive: panel.mainBreakerIsActive ?? true,
  });

  const isSubPanel = !!panel.parentFuseId;
  const typeColor = formData.mainBreakerColor || (isSubPanel ? FUSE_TYPE_COLORS.RCBO : FUSE_TYPE_COLORS.MAIN);

  useEffect(() => {
    if (showEditModal) {
      setFormData({
        mainBreakerAmperage: panel.mainBreakerAmperage || 63,
        mainBreakerType: panel.mainBreakerType || 'MAIN',
        mainBreakerPoles: panel.mainBreakerPoles || 2,
        mainBreakerCurveType: panel.mainBreakerCurveType || '',
        mainBreakerManufacturer: panel.mainBreakerManufacturer || '',
        mainBreakerModel: panel.mainBreakerModel || '',
        mainBreakerNotes: panel.mainBreakerNotes || '',
        mainBreakerDeviceUrl: panel.mainBreakerDeviceUrl || '',
        mainBreakerColor: panel.mainBreakerColor || '',
        mainBreakerIsActive: panel.mainBreakerIsActive ?? true,
      });
    }
  }, [panel, showEditModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePanel.mutateAsync({
      id: panel.id,
      data: {
        mainBreakerAmperage: formData.mainBreakerAmperage,
        mainBreakerType: formData.mainBreakerType,
        mainBreakerPoles: formData.mainBreakerPoles,
        mainBreakerCurveType: formData.mainBreakerCurveType || null,
        mainBreakerManufacturer: formData.mainBreakerManufacturer || null,
        mainBreakerModel: formData.mainBreakerModel || null,
        mainBreakerNotes: formData.mainBreakerNotes || null,
        mainBreakerDeviceUrl: formData.mainBreakerDeviceUrl || null,
        mainBreakerColor: formData.mainBreakerColor || null,
        mainBreakerIsActive: formData.mainBreakerIsActive,
      },
    });
    setShowEditModal(false);
  };

  return (
    <>
      <div
        className="relative bg-white rounded-lg shadow-md cursor-pointer transition-all hover:shadow-lg border-2"
        style={{ borderColor: typeColor, minWidth: '160px' }}
        onClick={() => setShowEditModal(true)}
      >
        {/* Type indicator bar */}
        <div
          className="h-2 rounded-t-md"
          style={{ backgroundColor: typeColor }}
        />

        <div className="p-3">
          {/* Icon and title */}
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} className="text-gray-700" />
            <span className="font-bold text-gray-900">
              {isSubPanel ? 'Sub-Panel Feed' : 'Main Breaker'}
            </span>
          </div>

          {/* Amperage display */}
          {isSubPanel && panel.feedAmperage ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-white text-xs font-medium bg-purple-600">
                  FEED
                </span>
                <span className="font-bold text-lg text-gray-800">
                  {panel.feedAmperage}A
                </span>
              </div>
              <div className="text-xs text-purple-600 font-medium">
                Fed from parent panel
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: typeColor }}
                >
                  {panel.mainBreakerType || 'MAIN'}
                </span>
                <span className="font-bold text-lg text-gray-800">
                  {panel.mainBreakerAmperage || '—'}A
                </span>
              </div>

              {/* Additional details */}
              <div className="space-y-1 text-xs text-gray-600 mt-2">
                <div className="flex items-center justify-between">
                  <span>Poles:</span>
                  <span className="font-medium">{panel.mainBreakerPoles || 2}-pole</span>
                </div>
                {panel.mainBreakerCurveType && (
                  <div className="flex items-center justify-between">
                    <span>Curve:</span>
                    <span className="font-medium">{panel.mainBreakerCurveType}</span>
                  </div>
                )}
                {panel.mainBreakerManufacturer && (
                  <div className="flex items-center justify-between">
                    <span>Make:</span>
                    <span className="font-medium truncate ml-2">{panel.mainBreakerManufacturer}</span>
                  </div>
                )}
                {panel.mainBreakerModel && (
                  <div className="flex items-center justify-between">
                    <span>Model:</span>
                    <span className="font-medium truncate ml-2">{panel.mainBreakerModel}</span>
                  </div>
                )}
                {!panel.mainBreakerIsActive && (
                  <div className="text-red-600 font-medium">
                    ⚠ Inactive
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Settings icon */}
        <div className="absolute top-2 right-2">
          <Settings size={14} className="text-gray-400" />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={isSubPanel ? 'Sub-Panel Feed Settings' : 'Main Breaker Settings'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Type"
              value={formData.mainBreakerType}
              onChange={(e) => setFormData({ ...formData, mainBreakerType: e.target.value })}
              placeholder="MAIN, MCB, etc."
            />

            <Select
              label="Amperage"
              value={formData.mainBreakerAmperage}
              onChange={(e) => setFormData({ ...formData, mainBreakerAmperage: parseInt(e.target.value) })}
              options={[...COMMON_AMPERAGES, 80, 100, 125, 150, 175, 200, 225, 300, 400].sort((a, b) => a - b).map((a) => ({ value: a, label: `${a}A` }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Curve Type"
              value={formData.mainBreakerCurveType}
              onChange={(e) => setFormData({ ...formData, mainBreakerCurveType: e.target.value })}
              options={[
                { value: '', label: 'None (typical for main breakers)' },
                ...CURVE_TYPES.map((c) => ({ value: c.value || '', label: `${c.label} - ${c.description}` })),
              ]}
            />
            <Select
              label="Poles"
              value={formData.mainBreakerPoles}
              onChange={(e) => setFormData({ ...formData, mainBreakerPoles: parseInt(e.target.value) })}
              options={[1, 2, 3, 4].map((p) => ({ value: p, label: `${p}-pole` }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturer"
              placeholder="ABB, Schneider, Square D, etc."
              value={formData.mainBreakerManufacturer}
              onChange={(e) => setFormData({ ...formData, mainBreakerManufacturer: e.target.value })}
            />
            <Input
              label="Model"
              placeholder="QO142M200, etc."
              value={formData.mainBreakerModel}
              onChange={(e) => setFormData({ ...formData, mainBreakerModel: e.target.value })}
            />
          </div>

          <Input
            label="Device URL"
            placeholder="https://example.com/product"
            type="url"
            value={formData.mainBreakerDeviceUrl}
            onChange={(e) => setFormData({ ...formData, mainBreakerDeviceUrl: e.target.value })}
          />

          <Input
            label="Custom Color (optional)"
            type="color"
            value={formData.mainBreakerColor}
            onChange={(e) => setFormData({ ...formData, mainBreakerColor: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Any additional notes..."
              value={formData.mainBreakerNotes}
              onChange={(e) => setFormData({ ...formData, mainBreakerNotes: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mainBreakerIsActive"
              checked={formData.mainBreakerIsActive}
              onChange={(e) => setFormData({ ...formData, mainBreakerIsActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="mainBreakerIsActive" className="text-sm text-gray-700">
              Breaker is active/on
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={updatePanel.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
