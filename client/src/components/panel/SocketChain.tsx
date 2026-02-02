import { useState } from 'react';
import type { FuseWithSockets } from '@fusemapper/shared';
import { SocketNode } from './SocketNode';
import { SubPanelModal } from './SubPanelModal';
import { useCreateSocket, useCreateSubPanel } from '@/hooks';
import { Plus, Grid3x3 } from 'lucide-react';

interface SocketChainProps {
  fuse: FuseWithSockets;
  panelId: string;
}

export function SocketChain({ fuse, panelId }: SocketChainProps) {
  const createSocket = useCreateSocket(panelId);
  const createSubPanel = useCreateSubPanel(panelId);
  const [isCreating, setIsCreating] = useState(false);
  const [showSubPanelModal, setShowSubPanelModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleAddSocket = async () => {
    setIsCreating(true);
    setShowOptions(false);
    try {
      await createSocket.mutateAsync({
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
    setShowOptions(false);
  };

  const handleAddClick = () => {
    setShowOptions(!showOptions);
  };

  // Check if fuse already has a sub-panel
  const hasSubPanel = !!(fuse as any).subPanel;

  return (
    <div className="flex flex-col items-center mt-2">
      {fuse.sockets.map((socket, index) => (
        <div key={socket.id} className="flex flex-col items-center">
          {/* Vertical connector */}
          <div className="w-0.5 h-4 bg-gray-300" />

          {/* Socket Node */}
          <SocketNode socket={socket} panelId={panelId} />

          {/* Show "add socket" or options after last socket */}
          {index === fuse.sockets.length - 1 && !hasSubPanel && (
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-gray-300" />
              <div className="relative">
                <button
                  onClick={handleAddClick}
                  disabled={isCreating}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
                    flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add socket or sub-panel"
                >
                  <Plus size={16} />
                </button>

                {/* Options menu */}
                {showOptions && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 whitespace-nowrap">
                    <button
                      onClick={handleAddSocket}
                      disabled={isCreating}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus size={14} />
                      Add Socket
                    </button>
                    <button
                      onClick={() => {
                        setShowSubPanelModal(true);
                        setShowOptions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Grid3x3 size={14} />
                      Add Sub-Panel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add first socket button when chain is empty */}
      {fuse.sockets.length === 0 && !hasSubPanel && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-4 bg-gray-300" />
          <div className="relative">
            <button
              onClick={handleAddClick}
              disabled={isCreating}
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
                flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add socket or sub-panel"
            >
              <Plus size={16} />
            </button>

            {/* Options menu */}
            {showOptions && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 whitespace-nowrap">
                <button
                  onClick={handleAddSocket}
                  disabled={isCreating}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add Socket
                </button>
                <button
                  onClick={() => {
                    setShowSubPanelModal(true);
                    setShowOptions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Grid3x3 size={14} />
                  Add Sub-Panel
                </button>
              </div>
            )}
          </div>
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
    </div>
  );
}
