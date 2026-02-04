import { useState, useEffect } from 'react';
import type { Fuse, FuseType, CurveType, SpdClass, CreateFuseInput } from '@fusemapper/shared';
import { FUSE_TYPES, CURVE_TYPES, COMMON_AMPERAGES, DEFAULT_FUSE_VALUES, SPD_VOLTAGE_RATINGS, SPD_SURGE_CURRENT_RATINGS, SPD_CLASSES } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
import { usePanel } from '@/hooks';
import { Trash2 } from 'lucide-react';

type FuseFormData = Omit<CreateFuseInput, 'panelId'>;

interface FuseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FuseFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
  deleteLoading?: boolean;
  fuse?: Fuse;
  panelId: string;
}

export function FuseModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  deleteLoading,
  fuse,
  panelId,
}: FuseModalProps) {
  const { data: panel } = usePanel(panelId);
  const [formData, setFormData] = useState({
    label: '',
    rowId: undefined as string | undefined,
    slotNumber: undefined as number | undefined,
    type: DEFAULT_FUSE_VALUES.type as FuseType,
    amperage: DEFAULT_FUSE_VALUES.amperage,
    curveType: DEFAULT_FUSE_VALUES.curveType as CurveType,
    poles: DEFAULT_FUSE_VALUES.poles,
    manufacturer: '',
    model: '',
    isActive: DEFAULT_FUSE_VALUES.isActive,
    notes: '',
    deviceUrl: '',
    // SPD-specific fields
    spdVoltageRating: undefined as number | undefined,
    spdSurgeCurrentRating: undefined as number | undefined,
    spdClass: null as SpdClass,
  });

  useEffect(() => {
    if (fuse) {
      setFormData({
        label: fuse.label || '',
        rowId: fuse.rowId ?? undefined,
        slotNumber: fuse.slotNumber ?? undefined,
        type: fuse.type as FuseType,
        amperage: fuse.amperage || DEFAULT_FUSE_VALUES.amperage,
        curveType: fuse.curveType as CurveType,
        poles: fuse.poles,
        manufacturer: fuse.manufacturer || '',
        model: fuse.model || '',
        isActive: fuse.isActive,
        notes: fuse.notes || '',
        deviceUrl: fuse.deviceUrl || '',
        // SPD-specific fields
        spdVoltageRating: fuse.spdVoltageRating ?? undefined,
        spdSurgeCurrentRating: fuse.spdSurgeCurrentRating ?? undefined,
        spdClass: fuse.spdClass as SpdClass,
      });
    } else {
      setFormData({
        label: '',
        rowId: undefined,
        slotNumber: undefined,
        type: DEFAULT_FUSE_VALUES.type as FuseType,
        amperage: DEFAULT_FUSE_VALUES.amperage,
        curveType: DEFAULT_FUSE_VALUES.curveType as CurveType,
        poles: DEFAULT_FUSE_VALUES.poles,
        manufacturer: '',
        model: '',
        isActive: DEFAULT_FUSE_VALUES.isActive,
        notes: '',
        deviceUrl: '',
        // SPD-specific fields
        spdVoltageRating: undefined,
        spdSurgeCurrentRating: undefined,
        spdClass: null,
      });
    }
  }, [fuse, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: FuseFormData = {
      label: formData.label || undefined,
      rowId: formData.rowId,
      slotNumber: formData.slotNumber,
      type: formData.type,
      amperage: formData.type === 'SPD' ? undefined : formData.amperage,
      curveType: formData.type === 'SPD' ? null : formData.curveType,
      poles: formData.type === 'SPD' ? 1 : formData.poles,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      isActive: formData.isActive,
      notes: formData.notes || undefined,
      deviceUrl: formData.deviceUrl || undefined,
      // SPD-specific fields
      spdVoltageRating: formData.type === 'SPD' ? formData.spdVoltageRating : undefined,
      spdSurgeCurrentRating: formData.type === 'SPD' ? formData.spdSurgeCurrentRating : undefined,
      spdClass: formData.type === 'SPD' ? formData.spdClass : null,
    };
    await onSubmit(data);
  };

  // Get available rows with capacity info
  const availableRows = panel?.rows?.map(row => {
    const fuseCount = row.fuses?.length || 0;
    const isFull = fuseCount >= row.maxFuses;
    // If editing existing fuse in this row, it has space
    const hasSpace = !isFull || (fuse?.rowId === row.id);
    return {
      ...row,
      fuseCount,
      isFull,
      hasSpace,
    };
  }) || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fuse ? 'Edit Breaker' : 'Add Breaker'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Input
              label="Label"
              placeholder="Kitchen Lights, Bathroom RCBO, etc."
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>
          <Input
            label="Slot Number"
            type="number"
            placeholder="1-999"
            min="1"
            max="999"
            value={formData.slotNumber ?? ''}
            onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value ? parseInt(e.target.value) : undefined })}
          />
        </div>

        <Select
          label="Assign to Row (optional)"
          value={formData.rowId ?? ''}
          onChange={(e) => setFormData({ ...formData, rowId: e.target.value || undefined })}
          options={[
            { value: '', label: 'Unassigned' },
            ...availableRows.map((row) => ({
              value: row.id,
              label: `${row.label || `Row ${row.position + 1}`} (${row.fuseCount}/${row.maxFuses} fuses)${!row.hasSpace ? ' - FULL' : ''}`,
              disabled: !row.hasSpace,
            })),
          ]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as FuseType })}
            options={FUSE_TYPES.map((t) => ({ value: t.value, label: `${t.label} - ${t.description}` }))}
          />

          {formData.type === 'SPD' ? (
            <Select
              label="Voltage Rating"
              value={formData.spdVoltageRating ?? ''}
              onChange={(e) => setFormData({ ...formData, spdVoltageRating: e.target.value ? parseInt(e.target.value) : undefined })}
              options={[
                { value: '', label: 'Select voltage' },
                ...SPD_VOLTAGE_RATINGS.map((v) => ({ value: v, label: `${v}V` })),
              ]}
            />
          ) : (
            <Select
              label="Amperage"
              value={formData.amperage}
              onChange={(e) => setFormData({ ...formData, amperage: parseInt(e.target.value) })}
              options={COMMON_AMPERAGES.map((a) => ({ value: a, label: `${a}A` }))}
            />
          )}
        </div>

        {formData.type === 'SPD' ? (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Surge Current Rating"
              value={formData.spdSurgeCurrentRating ?? ''}
              onChange={(e) => setFormData({ ...formData, spdSurgeCurrentRating: e.target.value ? parseInt(e.target.value) : undefined })}
              options={[
                { value: '', label: 'Select rating' },
                ...SPD_SURGE_CURRENT_RATINGS.map((r) => ({ value: r, label: `${r}kA` })),
              ]}
            />
            <Select
              label="SPD Class"
              value={formData.spdClass || ''}
              onChange={(e) => setFormData({ ...formData, spdClass: e.target.value as SpdClass || null })}
              options={[
                { value: '', label: 'Select class' },
                ...SPD_CLASSES.map((c) => ({ value: c.value, label: `${c.label} - ${c.description}` })),
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Curve Type"
              value={formData.curveType || ''}
              onChange={(e) => setFormData({ ...formData, curveType: e.target.value as CurveType || null })}
              options={[
                { value: '', label: 'None' },
                ...CURVE_TYPES.map((c) => ({ value: c.value || '', label: `${c.label} - ${c.description}` })),
              ]}
            />
            <Select
              label="Poles"
              value={formData.poles}
              onChange={(e) => setFormData({ ...formData, poles: parseInt(e.target.value) })}
              options={[1, 2, 3, 4].map((p) => ({ value: p, label: `${p}-pole` }))}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Manufacturer"
            placeholder="ABB, Schneider, etc."
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
          <Input
            label="Model"
            placeholder="S201-C16, etc."
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
        </div>

        <Input
          label="Device URL"
          placeholder="https://example.com/product"
          type="url"
          value={formData.deviceUrl}
          onChange={(e) => setFormData({ ...formData, deviceUrl: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            className="input min-h-[80px]"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Breaker is active/on
          </label>
        </div>

        <div className="flex justify-between pt-4">
          {fuse && onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onDelete}
              loading={deleteLoading}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {fuse ? 'Save' : 'Add Breaker'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
