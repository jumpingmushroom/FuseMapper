import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Printer } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { usePanel, useUpdatePanel, usePanelHierarchy } from '@/hooks';
import { Button, Card, CardBody, Modal, Input, Select } from '@/components/ui';
import { PanelTree } from '@/components/panel/PanelTree';
import { PanelBreadcrumbs } from '@/components/panel/PanelBreadcrumbs';
import { PrintableCircuitList } from '@/components/panel/PrintableCircuitList';
import { DevicePalette } from '@/components/device/DevicePalette';
import { DndProvider } from '@/components/dnd/DndProvider';
import { COMMON_AMPERAGES } from '@fusemapper/shared';

export function PanelEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentPanelId, setCurrentPanelId] = useState(id!);
  const { data: panel, isLoading, error } = usePanel(currentPanelId);
  const { data: hierarchy } = usePanelHierarchy(currentPanelId);
  const updatePanel = useUpdatePanel();
  const printRef = useRef<HTMLDivElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    mainBreakerAmperage: 63,
    mainBreakerType: 'MAIN',
  });

  // Update current panel when URL changes
  useEffect(() => {
    if (id) {
      setCurrentPanelId(id);
    }
  }, [id]);

  const handleNavigateToSubPanel = (subPanelId: string) => {
    setCurrentPanelId(subPanelId);
    navigate(`/panels/${subPanelId}`);
  };

  const handleNavigateToPanel = (panelId: string) => {
    setCurrentPanelId(panelId);
    navigate(`/panels/${panelId}`);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: panel?.name || 'Panel',
  });

  const handleOpenSettings = () => {
    if (panel) {
      setFormData({
        name: panel.name,
        location: panel.location || '',
        mainBreakerAmperage: panel.mainBreakerAmperage || 63,
        mainBreakerType: panel.mainBreakerType || 'MAIN',
      });
      setShowSettingsModal(true);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panel) return;

    await updatePanel.mutateAsync({
      id: panel.id,
      data: {
        name: formData.name,
        location: formData.location || undefined,
        mainBreakerAmperage: formData.mainBreakerAmperage,
        mainBreakerType: formData.mainBreakerType,
      },
    });
    setShowSettingsModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !panel) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <h3 className="font-semibold text-gray-900 mb-2">Panel not found</h3>
          <p className="text-gray-500 mb-4">
            The panel you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <DndProvider panelId={panel.id}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{panel.name}</h1>
              {panel.location && (
                <p className="text-gray-500">{panel.location}</p>
              )}
              {panel.parentFuseId && panel.feedAmperage && (
                <p className="text-sm text-purple-600 font-medium">
                  Sub-Panel • {panel.feedAmperage}A Feed
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handlePrint()}>
              <Printer size={18} />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={handleOpenSettings}>
              <Settings size={18} />
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        {hierarchy && hierarchy.length > 1 && (
          <PanelBreadcrumbs
            hierarchy={hierarchy}
            onNavigate={handleNavigateToPanel}
          />
        )}

        {/* Editor Layout */}
        <div className="flex gap-6">
          {/* Panel Tree */}
          <div className="flex-1 overflow-x-auto" ref={printRef}>
            <Card className="no-print">
              <CardBody className="p-6">
                <PanelTree
                  panel={panel as any}
                  onNavigateToSubPanel={handleNavigateToSubPanel}
                />
              </CardBody>
            </Card>
            {/* Printable Circuit List (hidden on screen, shown when printing) */}
            <PrintableCircuitList panel={panel as any} />
          </div>

          {/* Device Palette Sidebar */}
          <div className="w-80 flex-shrink-0 no-print">
            <DevicePalette panelId={panel.id} />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Panel Settings"
      >
        <form onSubmit={handleUpdateSettings} className="space-y-4">
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
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={updatePanel.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </DndProvider>
  );
}
