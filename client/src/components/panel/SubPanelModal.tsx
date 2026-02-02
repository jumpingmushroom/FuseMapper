import { useState, useEffect } from 'react';
import type { CreateSubPanelInput } from '@fusemapper/shared';
import { SUB_PANEL_FEED_OPTIONS } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';

type SubPanelFormData = Omit<CreateSubPanelInput, 'fuseId'>;

interface SubPanelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubPanelFormData) => Promise<void>;
  loading?: boolean;
  fuseAmperage?: number | null;
}

export function SubPanelModal({
  open,
  onClose,
  onSubmit,
  loading,
  fuseAmperage,
}: SubPanelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    feedAmperage: 40,
    location: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        feedAmperage: 40,
        location: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: SubPanelFormData = {
      name: formData.name,
      feedAmperage: formData.feedAmperage,
      location: formData.location || undefined,
    };
    await onSubmit(data);
  };

  // Filter feed options based on fuse amperage
  const availableFeedOptions = fuseAmperage
    ? SUB_PANEL_FEED_OPTIONS.filter(opt => opt.value <= fuseAmperage)
    : SUB_PANEL_FEED_OPTIONS;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Sub-Panel"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Sub-Panel Name"
          placeholder="Garage, Workshop, Shed..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Select
          label="Feed Amperage"
          value={formData.feedAmperage}
          onChange={(e) => setFormData({ ...formData, feedAmperage: parseInt(e.target.value) })}
          options={availableFeedOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }))}
          required
        />

        {fuseAmperage && (
          <div className="text-xs text-gray-500 -mt-2">
            Maximum feed amperage is limited to {fuseAmperage}A by the parent fuse
          </div>
        )}

        <Input
          label="Location (optional)"
          placeholder="Description of where this panel is located"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Sub-Panel Info:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>The new panel will start empty</li>
            <li>You can add rows and fuses to it after creation</li>
            <li>Click on this fuse later to navigate to the sub-panel</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Sub-Panel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
