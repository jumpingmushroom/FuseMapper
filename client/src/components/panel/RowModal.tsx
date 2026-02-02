import { useState, useEffect } from 'react';
import type { Row, CreateRowInput } from '@fusemapper/shared';
import { Modal, Button, Input } from '@/components/ui';
import { Trash2 } from 'lucide-react';

type RowFormData = Omit<CreateRowInput, 'panelId'>;

interface RowModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RowFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
  row?: Row;
}

export function RowModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  deleteLoading,
  row,
}: RowModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    maxFuses: 10,
    position: undefined as number | undefined,
  });

  useEffect(() => {
    if (row) {
      setFormData({
        label: row.label || '',
        maxFuses: row.maxFuses,
        position: row.position,
      });
    } else {
      setFormData({
        label: '',
        maxFuses: 10,
        position: undefined,
      });
    }
  }, [row, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: RowFormData = {
      label: formData.label || undefined,
      maxFuses: formData.maxFuses,
      position: formData.position,
    };
    await onSubmit(data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={row ? 'Edit Row' : 'Add Row'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Row Label (optional)"
          placeholder="Main Distribution, Kitchen & Bath, etc."
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />

        <Input
          label="Maximum Fuses"
          type="number"
          min="1"
          max="50"
          value={formData.maxFuses}
          onChange={(e) => setFormData({ ...formData, maxFuses: parseInt(e.target.value) || 10 })}
          required
        />

        {row && (
          <Input
            label="Row Position"
            type="number"
            min="0"
            value={formData.position ?? 0}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
          />
        )}

        <div className="flex justify-between pt-4">
          {row && onDelete ? (
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
              {row ? 'Save' : 'Add Row'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
