import { useState, useEffect } from 'react';
import type { Socket, UpdateSocketInput } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
import { useRooms } from '@/hooks';
import { Trash2 } from 'lucide-react';

interface SocketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateSocketInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
  socket?: Socket;
}

export function SocketModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  deleteLoading,
  socket,
}: SocketModalProps) {
  const { data: rooms = [] } = useRooms();
  const [formData, setFormData] = useState({
    label: '',
    roomId: '' as string | null,
    notes: '',
  });

  useEffect(() => {
    if (socket) {
      setFormData({
        label: socket.label || '',
        roomId: socket.roomId || '',
        notes: socket.notes || '',
      });
    } else {
      setFormData({
        label: '',
        roomId: '',
        notes: '',
      });
    }
  }, [socket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpdateSocketInput = {
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
      title={socket ? 'Edit Socket' : 'Add Socket'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label"
          placeholder="Kitchen outlet, Living room..."
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />

        <Select
          label="Room"
          value={formData.roomId || ''}
          onChange={(e) => setFormData({ ...formData, roomId: e.target.value || null })}
          options={[
            { value: '', label: 'No room assigned' },
            ...rooms.map((r) => ({ value: r.id, label: r.name })),
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
          {socket && onDelete ? (
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
              {socket ? 'Save' : 'Add Socket'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
