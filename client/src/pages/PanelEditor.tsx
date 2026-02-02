import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { usePanel } from '@/hooks';
import { Button, Card, CardBody } from '@/components/ui';
import { PanelGrid } from '@/components/panel/PanelGrid';
import { DevicePalette } from '@/components/device/DevicePalette';
import { DndProvider } from '@/components/dnd/DndProvider';

export function PanelEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: panel, isLoading, error } = usePanel(id!);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: panel?.name || 'Panel',
  });

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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{panel.name}</h1>
              {panel.location && (
                <p className="text-gray-500">{panel.location}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handlePrint()}>
              <Printer size={18} />
              Print
            </Button>
            <Button variant="ghost" size="sm">
              <Settings size={18} />
            </Button>
          </div>
        </div>

        {/* Editor Layout */}
        <div className="flex gap-6">
          {/* Panel Grid */}
          <div className="flex-1" ref={printRef}>
            <Card>
              <CardBody className="p-4">
                <PanelGrid panel={panel} />
              </CardBody>
            </Card>
          </div>

          {/* Device Palette Sidebar */}
          <div className="w-80 flex-shrink-0 no-print">
            <DevicePalette panelId={panel.id} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
