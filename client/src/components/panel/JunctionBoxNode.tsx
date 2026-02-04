import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { JunctionBoxWithSockets, UpdateJunctionBoxInput } from '@fusemapper/shared';
import { SocketNode } from './SocketNode';
import { HardwiredDeviceBranch } from '../device/HardwiredDeviceBranch';
import { HardwiredDeviceModal } from './HardwiredDeviceModal';
import { useUpdateJunctionBox, useDeleteJunctionBox, useCreateSocketOnJunctionBox, useCreateDeviceOnJunctionBox } from '@/hooks';
import { JunctionBoxModal } from './JunctionBoxModal';
import { GitBranch, Settings, Plus, Plug, Zap } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface JunctionBoxNodeProps {
  junctionBox: JunctionBoxWithSockets;
  panelId: string;
}

export function JunctionBoxNode({ junctionBox, panelId }: JunctionBoxNodeProps) {
  const updateJunctionBox = useUpdateJunctionBox(panelId);
  const deleteJunctionBox = useDeleteJunctionBox(panelId);
  const createSocket = useCreateSocketOnJunctionBox(panelId);
  const createDevice = useCreateDeviceOnJunctionBox(panelId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHardwiredModal, setShowHardwiredModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `junction-box-${junctionBox.id}`,
    data: { type: 'junction-box', junctionBoxId: junctionBox.id },
  });

  const handleUpdate = async (data: UpdateJunctionBoxInput) => {
    await updateJunctionBox.mutateAsync({ id: junctionBox.id, data });
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteJunctionBox.mutateAsync(junctionBox.id);
  };

  const handleAddSocket = async () => {
    setIsCreating(true);
    try {
      await createSocket.mutateAsync({
        junctionBoxId: junctionBox.id,
        data: {
          // Inherit room from junction box for auto-naming
          roomId: junctionBox.roomId || undefined,
        },
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateHardwiredDevice = async (data: any) => {
    await createDevice.mutateAsync({
      junctionBoxId: junctionBox.id,
      data: {
        name: data.name,
        icon: data.icon,
        category: data.category,
        estimatedWattage: data.estimatedWattage || undefined,
        roomId: data.roomId || undefined,
        notes: data.notes || undefined,
      },
    });
    setShowHardwiredModal(false);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Junction Box Container with Hardwired Branch */}
        <div className="flex items-center">
          <div
            ref={setNodeRef}
            className={`relative bg-amber-50 rounded-lg border transition-all cursor-pointer
              ${isOver ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-amber-200 hover:border-amber-300'}
            `}
            style={{ width: '150px', minHeight: '60px' }}
            onClick={() => setShowEditModal(true)}
          >
            {/* Room color indicator */}
            {junctionBox.room && (
              <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
                style={{ backgroundColor: junctionBox.room.color }}
              />
            )}

            <div className="p-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <GitBranch size={12} className="text-amber-600" />
                  <span className="text-[10px] font-medium text-amber-700">
                    {junctionBox.label || `Junction Box ${junctionBox.sortOrder + 1}`}
                  </span>
                </div>
                <Settings size={10} className="text-amber-300" />
              </div>

              {/* Room badge */}
              {junctionBox.room && (
                <div
                  className="inline-block px-1.5 py-0.5 rounded text-[9px] text-white font-medium mb-1"
                  style={{ backgroundColor: junctionBox.room.color }}
                >
                  {junctionBox.room.name}
                </div>
              )}

              {/* Message if no children */}
              {junctionBox.devices.length === 0 && junctionBox.sockets.length === 0 && (
                <div className="text-[10px] text-amber-600 text-center py-2">
                  Drop sockets or devices here
                </div>
              )}
            </div>
          </div>

          {/* Hardwired devices branching to the right */}
          {junctionBox.devices.length > 0 && (
            <HardwiredDeviceBranch devices={junctionBox.devices} panelId={panelId} />
          )}
        </div>

        {/* Branching sockets */}
        {junctionBox.sockets.length > 0 && (
          <div className="flex flex-col gap-2 pl-4 border-l-2 border-amber-200">
            {junctionBox.sockets.map((socket, index) => (
              <div key={socket.id} className="flex flex-col items-center">
                {/* Branch line */}
                <div className="absolute left-[-16px] top-1/2 w-4 h-0.5 bg-amber-200" />
                <SocketNode socket={socket} panelId={panelId} />

                {/* Show add button after last socket */}
                {index === junctionBox.sockets.length - 1 && (
                  <div className="flex flex-col items-center mt-2">
                    <div className="w-0.5 h-4 bg-amber-200" />
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          disabled={isCreating}
                          className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300 hover:border-amber-500
                            flex items-center justify-center text-amber-400 hover:text-amber-600 transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Add socket or device"
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
                            <Plug size={14} />
                            Add Socket
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onClick={() => setShowHardwiredModal(true)}
                            className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                          >
                            <Zap size={14} />
                            Add Hardwired Device
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add first socket button when no sockets */}
        {junctionBox.sockets.length === 0 && (
          <div className="flex flex-col items-center mt-2">
            <div className="w-0.5 h-4 bg-amber-200" />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  disabled={isCreating}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-amber-300 hover:border-amber-500
                    flex items-center justify-center text-amber-400 hover:text-amber-600 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Add socket or device"
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
                    <Plug size={14} />
                    Add Socket
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={() => setShowHardwiredModal(true)}
                    className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer outline-none"
                  >
                    <Zap size={14} />
                    Add Hardwired Device
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <span className="text-[10px] text-amber-600 mt-1">Add outlet or device</span>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <JunctionBoxModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        loading={updateJunctionBox.isPending}
        deleteLoading={deleteJunctionBox.isPending}
        junctionBox={junctionBox}
      />

      {/* Hardwired Device Modal */}
      <HardwiredDeviceModal
        open={showHardwiredModal}
        onClose={() => setShowHardwiredModal(false)}
        onSubmit={handleCreateHardwiredDevice}
        loading={createDevice.isPending}
        fuseLabel={junctionBox.label || 'Junction Box'}
      />
    </>
  );
}
