import { useState } from 'react';
import type { FuseWithSockets } from '@fusemapper/shared';
import { SocketNode } from './SocketNode';
import { useCreateSocket } from '@/hooks';
import { Plus } from 'lucide-react';

interface SocketChainProps {
  fuse: FuseWithSockets;
  panelId: string;
}

export function SocketChain({ fuse, panelId }: SocketChainProps) {
  const createSocket = useCreateSocket(panelId);
  const [isCreating, setIsCreating] = useState(false);

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

  return (
    <div className="flex flex-col items-center mt-2">
      {fuse.sockets.map((socket, index) => (
        <div key={socket.id} className="flex flex-col items-center">
          {/* Vertical connector */}
          <div className="w-0.5 h-4 bg-gray-300" />

          {/* Socket Node */}
          <SocketNode socket={socket} panelId={panelId} />

          {/* Show "add socket" only after last socket */}
          {index === fuse.sockets.length - 1 && (
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-gray-300" />
              <button
                onClick={handleAddSocket}
                disabled={isCreating}
                className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
                  flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add socket"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add first socket button when chain is empty */}
      {fuse.sockets.length === 0 && (
        <div className="flex flex-col items-center">
          <div className="w-0.5 h-4 bg-gray-300" />
          <button
            onClick={handleAddSocket}
            disabled={isCreating}
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500
              flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add socket"
          >
            <Plus size={16} />
          </button>
          <span className="text-[10px] text-gray-400 mt-1">Add socket</span>
        </div>
      )}
    </div>
  );
}
