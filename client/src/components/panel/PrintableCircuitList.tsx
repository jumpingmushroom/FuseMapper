import type { Panel, FuseWithSockets, RowWithFuses } from '@fusemapper/shared';

interface PrintableCircuitListProps {
  panel: Panel & {
    rows?: RowWithFuses[];
    fuses?: FuseWithSockets[];
  };
}

export function PrintableCircuitList({ panel }: PrintableCircuitListProps) {
  // Collect all fuses from rows and unassigned fuses
  const allFuses = [
    ...(panel.rows?.flatMap(row => row.fuses ?? []) ?? []),
    ...(panel.fuses?.filter(f => !f.rowId) ?? []),
  ].sort((a, b) => {
    // Sort by slot number, nulls last
    if (a.slotNumber === null && b.slotNumber === null) return 0;
    if (a.slotNumber === null) return 1;
    if (b.slotNumber === null) return -1;
    return a.slotNumber - b.slotNumber;
  });

  return (
    <div className="print-only">
      <style>{`
        @media print {
          .print-only { display: block !important; }
          .no-print { display: none !important; }
          @page { margin: 1cm; size: A4; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Circuit Documentation</h1>
          <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-gray-300 py-2">
            <div><strong>Panel:</strong> {panel.name}</div>
            {panel.location && <div><strong>Location:</strong> {panel.location}</div>}
            {panel.mainBreakerAmperage && (
              <div><strong>Main Breaker:</strong> {panel.mainBreakerAmperage}A {panel.mainBreakerType || ''}</div>
            )}
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Circuit Table */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-16">Slot</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold">Description</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-20">Type</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold w-16">Rating</th>
              <th className="border border-gray-400 px-2 py-2 text-center font-bold w-16">Poles</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold">Devices</th>
            </tr>
          </thead>
          <tbody>
            {/* Main Breaker Row */}
            <tr className="bg-yellow-50">
              <td className="border border-gray-400 px-2 py-2 text-center font-bold">MAIN</td>
              <td className="border border-gray-400 px-2 py-2 font-semibold">Main Breaker</td>
              <td className="border border-gray-400 px-2 py-2">{panel.mainBreakerType || 'MAIN'}</td>
              <td className="border border-gray-400 px-2 py-2 text-center">
                {panel.mainBreakerAmperage ? `${panel.mainBreakerAmperage}A` : '-'}
              </td>
              <td className="border border-gray-400 px-2 py-2 text-center">-</td>
              <td className="border border-gray-400 px-2 py-2 text-gray-500">Panel supply</td>
            </tr>

            {/* Fuse Rows */}
            {allFuses.map((fuse) => {
              const allDevices = (fuse.sockets?.flatMap(socket => socket.devices ?? []) ?? []).filter(d => d);
              const socketLabels = fuse.sockets
                ?.filter(s => s.label)
                .map(s => s.label)
                .join(' → ') ?? '';

              return (
                <tr key={fuse.id} className={!fuse.isActive ? 'bg-gray-50 text-gray-500' : ''}>
                  <td className="border border-gray-400 px-2 py-2 text-center font-bold">
                    {fuse.slotNumber ?? '-'}
                  </td>
                  <td className="border border-gray-400 px-2 py-2">
                    <div className="font-medium">{fuse.label || 'Unlabeled'}</div>
                    {socketLabels && (
                      <div className="text-xs text-gray-600 mt-1">Sockets: {socketLabels}</div>
                    )}
                    {fuse.notes && (
                      <div className="text-xs text-gray-500 mt-1 italic">{fuse.notes}</div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-2">
                    {fuse.type}
                    {fuse.curveType && <span className="text-gray-600">/{fuse.curveType}</span>}
                  </td>
                  <td className="border border-gray-400 px-2 py-2 text-center">
                    {fuse.amperage ? `${fuse.amperage}A` : '-'}
                  </td>
                  <td className="border border-gray-400 px-2 py-2 text-center">{fuse.poles}</td>
                  <td className="border border-gray-400 px-2 py-2">
                    {allDevices.length > 0 ? (
                      <div>
                        {allDevices.map((device, idx) => (
                          <div key={device.id} className="text-xs">
                            {idx + 1}. {device.name}
                            {device.estimatedWattage && (
                              <span className="text-gray-600"> ({device.estimatedWattage}W)</span>
                            )}
                            {device.room && (
                              <span className="text-gray-500"> - {device.room.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No devices</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {allFuses.length === 0 && (
              <tr>
                <td colSpan={6} className="border border-gray-400 px-2 py-4 text-center text-gray-500">
                  No circuits configured
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-600 border-t border-gray-300 pt-4">
          <p><strong>Important:</strong> This document represents the electrical installation at the time of printing.
          Any modifications to the installation should be reflected in this documentation.</p>
          <p className="mt-2">Generated by FuseMapper on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
