import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { SocketWithDevices, UpdateSocketInput } from '@fusemapper/shared';
import { DeviceList } from '../device/DeviceList';
import { HardwiredDeviceBranch } from '../device/HardwiredDeviceBranch';
import { useUpdateSocket, useDeleteSocket } from '@/hooks';
import { SocketModal } from './SocketModal';
import { Plug, Settings } from 'lucide-react';

interface SocketNodeProps {
  socket: SocketWithDevices;
  panelId: string;
}

export function SocketNode({ socket, panelId }: SocketNodeProps) {
  const updateSocket = useUpdateSocket(panelId);
  const deleteSocket = useDeleteSocket(panelId);
  const [showEditModal, setShowEditModal] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `socket-${socket.id}`,
    data: { type: 'socket', socketId: socket.id },
  });

  const handleUpdate = async (data: UpdateSocketInput) => {
    await updateSocket.mutateAsync({ id: socket.id, data });
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteSocket.mutateAsync(socket.id);
  };

  // Separate hardwired and regular devices
  const regularDevices = socket.devices.filter(d => !d.isHardwired);
  const hardwiredDevices = socket.devices.filter(d => d.isHardwired);

  return (
    <>
      <div className="flex items-center">
        {/* Socket Node */}
        <div
          ref={setNodeRef}
          className={`relative bg-gray-50 rounded-lg border transition-all cursor-pointer
            ${isOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
          `}
          style={{ width: '150px', minHeight: '60px' }}
          onClick={() => setShowEditModal(true)}
        >
          {/* Room color indicator */}
          {socket.room && (
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
              style={{ backgroundColor: socket.room.color }}
            />
          )}

          <div className="p-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Plug size={12} className="text-gray-400" />
                <span className="text-[10px] font-medium text-gray-500">
                  {socket.label || `Socket ${socket.sortOrder + 1}`}
                </span>
              </div>
              <Settings size={10} className="text-gray-300" />
            </div>

            {/* Room badge */}
            {socket.room && (
              <div
                className="inline-block px-1.5 py-0.5 rounded text-[9px] text-white font-medium mb-1"
                style={{ backgroundColor: socket.room.color }}
              >
                {socket.room.name}
              </div>
            )}

            {/* Regular devices (inside socket) */}
            {regularDevices.length > 0 ? (
              <DeviceList
                devices={regularDevices}
                panelId={panelId}
                compact
              />
            ) : (
              <div className="text-[10px] text-gray-400 text-center py-2">
                Drop devices here
              </div>
            )}
          </div>
        </div>

        {/* Hardwired devices branching to the right */}
        {hardwiredDevices.length > 0 && (
          <HardwiredDeviceBranch devices={hardwiredDevices} panelId={panelId} />
        )}
      </div>

      {/* Edit Modal */}
      <SocketModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        loading={updateSocket.isPending}
        deleteLoading={deleteSocket.isPending}
        socket={socket}
      />
    </>
  );
}
