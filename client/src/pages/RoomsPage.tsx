import { useState } from 'react';
import { Plus, Trash2, Edit2, Home } from 'lucide-react';
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } from '@/hooks';
import { Button, Card, CardBody, Modal, Input } from '@/components/ui';

const DEFAULT_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#6366F1',
];

export function RoomsPage() {
  const { data: rooms, isLoading } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ id: string; name: string; color: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6' });

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({ name: '', color: '#3B82F6' });
    setShowModal(true);
  };

  const openEditModal = (room: { id: string; name: string; color: string }) => {
    setEditingRoom(room);
    setFormData({ name: room.name, color: room.color });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      await updateRoom.mutateAsync({
        id: editingRoom.id,
        data: { name: formData.name, color: formData.color },
      });
    } else {
      await createRoom.mutateAsync(formData);
    }
    setShowModal(false);
    setFormData({ name: '', color: '#3B82F6' });
    setEditingRoom(null);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteRoom.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-500">Organize devices by room with color coding</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={openCreateModal}>
          Add Room
        </Button>
      </div>

      {rooms?.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Home size={32} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No rooms yet</h3>
            <p className="text-gray-500 mb-4">
              Create rooms to organize your devices with color coding.
            </p>
            <Button icon={<Plus size={18} />} onClick={openCreateModal}>
              Add Room
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room) => (
            <Card key={room.id}>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: room.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      {room._count?.devices || 0} device{room._count?.devices !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(room)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(room.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRoom(null);
        }}
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Room Name"
            placeholder="Living Room, Kitchen, etc."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="mt-2 w-full h-8 cursor-pointer rounded"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setEditingRoom(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createRoom.isPending || updateRoom.isPending}
            >
              {editingRoom ? 'Save' : 'Add Room'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Room"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this room? Devices in this room will be
          unassigned but not deleted.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteRoom.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
