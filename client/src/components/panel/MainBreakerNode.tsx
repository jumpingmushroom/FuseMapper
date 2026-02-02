import { useState } from 'react';
import type { Panel } from '@fusemapper/shared';
import { FUSE_TYPE_COLORS } from '@fusemapper/shared';
import { Zap, Settings } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useUpdatePanel } from '@/hooks';
import { COMMON_AMPERAGES } from '@fusemapper/shared';

interface MainBreakerNodeProps {
  panel: Panel;
}

export function MainBreakerNode({ panel }: MainBreakerNodeProps) {
  const updatePanel = useUpdatePanel();
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    mainBreakerAmperage: panel.mainBreakerAmperage || 63,
    mainBreakerType: panel.mainBreakerType || 'MAIN',
  });

  const isSubPanel = !!panel.parentFuseId;
  const typeColor = isSubPanel ? FUSE_TYPE_COLORS.RCBO : FUSE_TYPE_COLORS.MAIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePanel.mutateAsync({
      id: panel.id,
      data: {
        mainBreakerAmperage: formData.mainBreakerAmperage,
        mainBreakerType: formData.mainBreakerType,
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
            <div className="flex items-center justify-between">
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
        title="Main Breaker Settings"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Amperage"
            value={formData.mainBreakerAmperage}
            onChange={(e) => setFormData({ ...formData, mainBreakerAmperage: parseInt(e.target.value) })}
            options={[...COMMON_AMPERAGES, 80, 100, 125].sort((a, b) => a - b).map((a) => ({ value: a, label: `${a}A` }))}
          />

          <Input
            label="Type"
            value={formData.mainBreakerType}
            onChange={(e) => setFormData({ ...formData, mainBreakerType: e.target.value })}
            placeholder="MAIN, MCB, etc."
          />

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
