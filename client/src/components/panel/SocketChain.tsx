import { useState } from 'react';
import type { FuseWithSockets } from '@fusemapper/shared';
import { SocketNode } from './SocketNode';
import { JunctionBoxNode } from './JunctionBoxNode';
import { SubPanelModal } from './SubPanelModal';
import { HardwiredDeviceModal } from './HardwiredDeviceModal';
import { useCreateSocket, useCreateJunctionBox, useCreateSubPanel, useCreateDevice } from '@/hooks';
import { Plus, Grid3x3, Zap, GitBranch } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface SocketChainProps {
  fuse: FuseWithSockets;
  panelId: string;
}

export function SocketChain({ fuse, panelId }: SocketChainProps) {
  const createSocket = useCreateSocket(panelId);
  const createJunctionBox = useCreateJunctionBox(panelId);
  const createSubPanel = useCreateSubPanel(panelId);
  const createDevice = useCreateDevice(panelId);
  const [isCreating, setIsCreating] = useState(false);
  const [showSubPanelModal, setShowSubPanelModal] = useState(false);
  const [showHardwiredModal, setShowHardwiredModal] = useState(false);

  const handleAddSocket = async () => {
    setIsCreating(true);
    try {
      await createSocket.mutateAsync({
        fuseId: fuse.id,
        data: {},
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddJunctionBox = async () => {
    setIsCreating(true);
    try {
      await createJunctionBox.mutateAsync({
        fuseId: fuse.id,
        data: {},
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSubPanel = async (data: { name: string; feedAmperage: number; location?: string }) => {
    await createSubPanel.mutateAsync({
      fuseId: fuse.id,
      data,
    });
    setShowSubPanelModal(false);
  };

  const handleCreateHardwiredDevice = async (data: any) => {
    await createDevice.mutateAsync({
      fuseId: fuse.id,
      name: data.name,
      icon: data.icon,
      category: data.category,
      roomId: data.roomId || undefined,
      estimatedWattage: data.estimatedWattage || undefined,
      notes: data.notes || undefined,
    });
    setShowHardwiredModal(false);
  };

  // Check if fuse already has a sub-panel
  const hasSubPanel = !!(fuse as any).subPanel;

  // SPDs should not have sockets/devices attached (inline protection only)
  const isSPD = fuse.type === 'SPD';

  return (
    <div className="flex flex-col items-center mt-2">
      {/* SPD info message */}
      {isSPD && (
        <div className="text-[10px] text-amber-600 mt-1 font-medium">
          SPD - Inline protection (no loads)
        </div>
      )}

      {!isSPD && fuse.sockets.map((socket, index) => (
        <div key={socket.id} className="flex flex-col items-center">
          {/* Vertical connector */}
          <div className="w-0.5 h-4 bg-gray-300" />

          {/* Socket Node */}
          <SocketNode socket={socket} panelId={panelId} />

          {/* Show "add socket" or options after last socket */}
          {index === fuse.sockets.length - 1 && !hasSubPanel && (
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-gray-300" />
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    disabled={isCreating}
                    className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
                      flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Add socket or sub-panel"
                  >
                    <Plus size={16} />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 whitespace-nowrap"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item
                      onClick={handleAddSocket}
                      disabled={isCreating}
                      className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none disabled:opacity-50"
                    >
                      <Plus size={14} />
                      Add Socket
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={handleAddJunctionBox}
                      disabled={isCreating}
                      className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none disabled:opacity-50"
                    >
                      <GitBranch size={14} />
                      Add Junction Box
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() => setShowHardwiredModal(true)}
                      className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                    >
                      <Zap size={14} />
                      Add Hardwired Device
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() => setShowSubPanelModal(true)}
                      className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                    >
                      <Grid3x3 size={14} />
                      Add Sub-Panel
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          )}
        </div>
      ))}

      {/* Junction Boxes */}
      {!isSPD && fuse.junctionBoxes && fuse.junctionBoxes.length > 0 && fuse.junctionBoxes.map((junctionBox) => (
        <div key={junctionBox.id} className="flex flex-col items-center">
          {/* Vertical connector */}
          <div className="w-0.5 h-4 bg-gray-300" />

          {/* Junction Box Node */}
          <JunctionBoxNode junctionBox={junctionBox} panelId={panelId} />
        </div>
      ))}

      {/* Add first socket button when chain is empty */}
      {!isSPD && fuse.sockets.length === 0 && (fuse.junctionBoxes?.length === 0 || !fuse.junctionBoxes) && !hasSubPanel && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-4 bg-gray-300" />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                disabled={isCreating}
                className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
                  flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add socket or sub-panel"
              >
                <Plus size={16} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 whitespace-nowrap"
                sideOffset={8}
              >
                <DropdownMenu.Item
                  onClick={handleAddSocket}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add Socket
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={handleAddJunctionBox}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none disabled:opacity-50"
                >
                  <GitBranch size={14} />
                  Add Junction Box
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setShowHardwiredModal(true)}
                  className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                >
                  <Zap size={14} />
                  Add Hardwired Device
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setShowSubPanelModal(true)}
                  className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                >
                  <Grid3x3 size={14} />
                  Add Sub-Panel
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <span className="text-[10px] text-gray-400 mt-1">Add load</span>
        </div>
      )}

      {/* Sub-Panel Modal */}
      <SubPanelModal
        open={showSubPanelModal}
        onClose={() => setShowSubPanelModal(false)}
        onSubmit={handleCreateSubPanel}
        loading={createSubPanel.isPending}
        fuseAmperage={fuse.amperage}
      />

      {/* Hardwired Device Modal */}
      <HardwiredDeviceModal
        open={showHardwiredModal}
        onClose={() => setShowHardwiredModal(false)}
        onSubmit={handleCreateHardwiredDevice}
        loading={createDevice.isPending}
        fuseLabel={fuse.label || 'Unlabeled'}
      />
    </div>
  );
}
