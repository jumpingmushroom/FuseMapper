import { useState, useEffect } from 'react';
import type { Fuse, FuseType, CurveType, CreateFuseInput } from '@fusemapper/shared';
import { FUSE_TYPES, CURVE_TYPES, COMMON_AMPERAGES, DEFAULT_FUSE_VALUES } from '@fusemapper/shared';
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
      amperage: formData.amperage,
      curveType: formData.curveType,
      poles: formData.poles,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      isActive: formData.isActive,
      notes: formData.notes || undefined,
      deviceUrl: formData.deviceUrl || undefined,
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
          <Select
            label="Amperage"
            value={formData.amperage}
            onChange={(e) => setFormData({ ...formData, amperage: parseInt(e.target.value) })}
            options={COMMON_AMPERAGES.map((a) => ({ value: a, label: `${a}A` }))}
          />
        </div>

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
