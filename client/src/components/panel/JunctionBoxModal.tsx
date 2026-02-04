import { useState, useEffect } from 'react';
import type { JunctionBox, UpdateJunctionBoxInput } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useRooms } from '@/hooks';
import { Trash2 } from 'lucide-react';

interface JunctionBoxModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateJunctionBoxInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
  junctionBox?: JunctionBox;
}

export function JunctionBoxModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  deleteLoading,
  junctionBox,
}: JunctionBoxModalProps) {
  const { data: rooms = [] } = useRooms();
  const [formData, setFormData] = useState({
    label: '',
    roomId: '' as string | null,
    notes: '',
  });

  useEffect(() => {
    if (junctionBox) {
      setFormData({
        label: junctionBox.label || '',
        roomId: junctionBox.roomId || '',
        notes: junctionBox.notes || '',
      });
    } else {
      setFormData({
        label: '',
        roomId: '',
        notes: '',
      });
    }
  }, [junctionBox, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpdateJunctionBoxInput = {
      label: formData.label || undefined,
      roomId: formData.roomId || null,
      notes: formData.notes || undefined,
    };
    await onSubmit(data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={junctionBox ? 'Edit Junction Box' : 'Add Junction Box'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label (optional)"
          placeholder="Leave empty to auto-generate (e.g., KIT-JB1)"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          helperText="Auto-generates based on room if left empty"
        />

        <Select
          label="Room"
          value={formData.roomId || ''}
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value || null })}
          options={[
            { value: '', label: 'No room assigned' },
            ...rooms.map((r) => ({
              value: r.id,
              label: r.code ? `${r.name} (${r.code})` : r.name
            })),
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-between pt-4">
          {junctionBox && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onDelete}
              loading={deleteLoading}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {junctionBox ? 'Save' : 'Add Junction Box'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
