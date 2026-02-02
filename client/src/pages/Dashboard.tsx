import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Zap, MapPin, Trash2, Edit2, LayoutGrid } from 'lucide-react';
import { usePanels, useCreatePanel, useDeletePanel } from '@/hooks';
import { Button, Card, CardBody, Modal, Input, Select } from '@/components/ui';
import { COMMON_AMPERAGES } from '@fusemapper/shared';

export function Dashboard() {
  const { data: panels, isLoading } = usePanels();
  const createPanel = useCreatePanel();
  const deletePanel = useDeletePanel();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mainBreakerAmperage: 63,
    mainBreakerType: 'MAIN',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPanel.mutateAsync({
      name: formData.name,
      location: formData.location || undefined,
      mainBreakerAmperage: formData.mainBreakerAmperage,
      mainBreakerType: formData.mainBreakerType,
    });
    setShowCreateModal(false);
    setFormData({ name: '', location: '', mainBreakerAmperage: 63, mainBreakerType: 'MAIN' });
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deletePanel.mutateAsync(deleteTarget);
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
          <h1 className="text-2xl font-bold text-gray-900">Panels</h1>
          <p className="text-gray-500">Manage your electrical panels</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
          New Panel
        </Button>
      </div>

      {panels?.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Zap size={32} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No panels yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first electrical panel to start mapping your fuses and devices.
            </p>
            <Button icon={<Plus size={18} />} onClick={() => setShowCreateModal(true)}>
              Create Panel
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {panels?.map((panel) => {
            const fuseCount = panel.fuses?.length || 0;
            // Count devices across all sockets
            const deviceCount = panel.fuses?.reduce(
              (acc, fuse) => acc + (fuse.sockets?.reduce(
                (sockAcc, socket) => sockAcc + (socket.devices?.length || 0),
                0
              ) || 0),
              0
            ) || 0;
            const socketCount = panel.fuses?.reduce(
              (acc, fuse) => acc + (fuse.sockets?.length || 0),
              0
            ) || 0;

            return (
              <Card key={panel.id} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <LayoutGrid size={24} className="text-blue-600" />
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/panels/${panel.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(panel.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <Link to={`/panels/${panel.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 mb-1">{panel.name}</h3>
                    {panel.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <MapPin size={14} />
                        <span>{panel.location}</span>
                      </div>
                    )}

                    {panel.mainBreakerAmperage && (
                      <div className="text-sm mb-3">
                        <span className="text-gray-500">Main Breaker:</span>{' '}
                        <span className="font-medium">{panel.mainBreakerAmperage}A</span>
                      </div>
                    )}

                    <div className="flex gap-4 pt-3 border-t border-gray-100 text-sm">
                      <div>
                        <span className="text-gray-500">Fuses:</span>{' '}
                        <span className="font-medium">{fuseCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sockets:</span>{' '}
                        <span className="font-medium">{socketCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Devices:</span>{' '}
                        <span className="font-medium">{deviceCount}</span>
                      </div>
                    </div>
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Panel"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Panel Name"
            placeholder="Main Panel"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Location"
            placeholder="Garage, Basement, etc."
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Main Breaker Amperage"
              value={formData.mainBreakerAmperage}
              onChange={(e) => setFormData({ ...formData, mainBreakerAmperage: parseInt(e.target.value) })}
              options={[...COMMON_AMPERAGES, 80, 100, 125].sort((a, b) => a - b).map((a) => ({ value: a, label: `${a}A` }))}
            />
            <Input
              label="Main Breaker Type"
              value={formData.mainBreakerType}
              onChange={(e) => setFormData({ ...formData, mainBreakerType: e.target.value })}
              placeholder="MAIN, MCB, etc."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createPanel.isPending}>
              Create Panel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Panel"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this panel? This will also delete all fuses,
          sockets, and unassign all devices. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deletePanel.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
