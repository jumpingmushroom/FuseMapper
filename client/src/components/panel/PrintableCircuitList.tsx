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

  // Helper to get hardwired devices for a fuse
  const getHardwiredDevices = (fuse: any) => {
    const directDevices = fuse.hardwiredDevices?.filter((d: any) => d.fuseId === fuse.id) ?? [];
    const junctionBoxDevices = fuse.junctionBoxes?.flatMap((jb: any) =>
      jb.devices?.filter((d: any) => d.junctionBoxId === jb.id) ?? []
    ) ?? [];
    return [...directDevices, ...junctionBoxDevices];
  };

  return (
    <div className="print-only">
      <style>{`
        @media print {
          .print-only { display: block !important; }
          .no-print { display: none !important; }
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Hide browser print headers/footers */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Kursfortegnelse</h1>
          <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-gray-300 py-2">
            <div><strong>Anlegg:</strong> {panel.name}</div>
            {panel.location && <div><strong>Plassering:</strong> {panel.location}</div>}
            {panel.mainBreakerAmperage && (
              <div>
                <strong>Hovedsikring:</strong> {panel.mainBreakerAmperage}A
                {panel.mainBreakerType && ` ${panel.mainBreakerType}`}
                {panel.mainBreakerCurveType && `/${panel.mainBreakerCurveType}`}
                {panel.mainBreakerPoles > 1 && ` (${panel.mainBreakerPoles}P)`}
              </div>
            )}
            <div><strong>Dato:</strong> {new Date().toLocaleDateString('no-NO')}</div>
          </div>
        </div>

        {/* Circuit Table - Norwegian Standard */}
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-16">Kurs nr.</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-32">Vern</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-24">Kabel</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold">Hva kursen går til</th>
              <th className="border border-gray-400 px-2 py-2 text-left font-bold w-40">Merknader</th>
            </tr>
          </thead>
          <tbody>
            {/* Main Breaker Row */}
            <tr className="bg-yellow-50">
              <td className="border border-gray-400 px-2 py-2 text-center font-bold">HOVED</td>
              <td className="border border-gray-400 px-2 py-2">
                {panel.mainBreakerAmperage ? `${panel.mainBreakerAmperage}A` : '-'}
                {panel.mainBreakerType && ` ${panel.mainBreakerType}`}
                {panel.mainBreakerCurveType && `/${panel.mainBreakerCurveType}`}
                {panel.mainBreakerPoles > 1 && (
                  <span className="text-xs text-gray-600"> ({panel.mainBreakerPoles}P)</span>
                )}
              </td>
              <td className="border border-gray-400 px-2 py-2 text-center text-gray-500">-</td>
              <td className="border border-gray-400 px-2 py-2 font-semibold">
                Hovedsikring - forsyning til tavle
              </td>
              <td className="border border-gray-400 px-2 py-2 text-xs text-gray-600">
                {panel.mainBreakerManufacturer && `${panel.mainBreakerManufacturer} `}
                {panel.mainBreakerModel && panel.mainBreakerModel}
                {panel.mainBreakerNotes && (
                  <div className="mt-1 italic">{panel.mainBreakerNotes}</div>
                )}
              </td>
            </tr>

            {/* Fuse Rows */}
            {allFuses.map((fuse) => {
              const hardwiredDevices = getHardwiredDevices(fuse);
              const hasSubPanel = !!fuse.subPanel;

              // Build description: label + hardwired devices
              let description = fuse.label || 'Ikke merket';
              if (hardwiredDevices.length > 0) {
                const deviceNames = hardwiredDevices.map(d => d.name).join(', ');
                description += ` (${deviceNames})`;
              }
              if (hasSubPanel) {
                description += ` → Undertavle: ${fuse.subPanel?.name}`;
              }

              return (
                <tr key={fuse.id} className={!fuse.isActive ? 'bg-gray-50 text-gray-500' : ''}>
                  <td className="border border-gray-400 px-2 py-2 text-center font-bold">
                    {fuse.slotNumber ?? '-'}
                  </td>
                  <td className="border border-gray-400 px-2 py-2">
                    {fuse.amperage ? `${fuse.amperage}A` : '-'}
                    {' '}{fuse.type}
                    {fuse.curveType && `/${fuse.curveType}`}
                    {fuse.poles > 1 && (
                      <span className="text-xs text-gray-600"> ({fuse.poles}P)</span>
                    )}
                    {fuse.type === 'SPD' && fuse.spdClass && (
                      <div className="text-xs text-gray-600 mt-1">
                        {fuse.spdClass}
                        {fuse.spdVoltageRating && `, ${fuse.spdVoltageRating}V`}
                        {fuse.spdSurgeCurrentRating && `, ${fuse.spdSurgeCurrentRating}kA`}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-2 text-xs">
                    {fuse.cableCrossSection || '-'}
                    {fuse.circuitLength && (
                      <div className="text-gray-600">{fuse.circuitLength}m</div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-2">
                    {description}
                    {!fuse.isActive && (
                      <span className="text-xs text-gray-500 ml-2">(Ikke i bruk)</span>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-2 text-xs text-gray-600">
                    {fuse.manufacturer && `${fuse.manufacturer} `}
                    {fuse.model && fuse.model}
                    {fuse.notes && (
                      <div className="mt-1 italic">{fuse.notes}</div>
                    )}
                  </td>
                </tr>
              );
            })}

            {allFuses.length === 0 && (
              <tr>
                <td colSpan={4} className="border border-gray-400 px-2 py-4 text-center text-gray-500">
                  Ingen kurser konfigurert
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-6 text-xs text-gray-600 border-t border-gray-300 pt-4">
          <p><strong>Viktig:</strong> Dette dokumentet viser det elektriske anlegget på utskriftstidspunktet.
          Eventuelle endringer i anlegget skal reflekteres i denne dokumentasjonen.</p>
          <p className="mt-2">Generert av FuseMapper {new Date().toLocaleString('no-NO')}</p>
          <p className="mt-1 text-gray-500">
            Dokumentasjon i henhold til NEK 400:2022 § 514.5.1
          </p>
        </div>
      </div>
    </div>
  );
}
