import { useState, useEffect } from 'react';
import type { Fuse, FuseType, CurveType, CreateFuseInput } from '@fusemapper/shared';
import { FUSE_TYPES, CURVE_TYPES, COMMON_AMPERAGES, DEFAULT_FUSE_VALUES } from '@fusemapper/shared';
import { Modal, Button, Input, Select } from '@/components/ui';
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
  defaultValues?: { row: number; slotStart: number };
}

export function FuseModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  deleteLoading,
  fuse,
  defaultValues,
}: FuseModalProps) {
  const [formData, setFormData] = useState({
    label: '',
    type: DEFAULT_FUSE_VALUES.type as FuseType,
    amperage: DEFAULT_FUSE_VALUES.amperage,
    curveType: DEFAULT_FUSE_VALUES.curveType as CurveType,
    poles: DEFAULT_FUSE_VALUES.poles,
    slotWidth: DEFAULT_FUSE_VALUES.slotWidth,
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
        type: fuse.type as FuseType,
        amperage: fuse.amperage || DEFAULT_FUSE_VALUES.amperage,
        curveType: fuse.curveType as CurveType,
        poles: fuse.poles,
        slotWidth: fuse.slotWidth,
        manufacturer: fuse.manufacturer || '',
        model: fuse.model || '',
        isActive: fuse.isActive,
        notes: fuse.notes || '',
        deviceUrl: fuse.deviceUrl || '',
      });
    } else {
      setFormData({
        label: '',
        type: DEFAULT_FUSE_VALUES.type as FuseType,
        amperage: DEFAULT_FUSE_VALUES.amperage,
        curveType: DEFAULT_FUSE_VALUES.curveType as CurveType,
        poles: DEFAULT_FUSE_VALUES.poles,
        slotWidth: DEFAULT_FUSE_VALUES.slotWidth,
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
      type: formData.type,
      amperage: formData.amperage,
      curveType: formData.curveType,
      poles: formData.poles,
      slotWidth: formData.slotWidth,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      isActive: formData.isActive,
      notes: formData.notes || undefined,
      deviceUrl: formData.deviceUrl || undefined,
      row: defaultValues?.row ?? fuse?.row ?? 0,
      slotStart: defaultValues?.slotStart ?? fuse?.slotStart ?? 0,
    };
    await onSubmit(data);
  };

  const handleTypeChange = (type: FuseType) => {
    const typeInfo = FUSE_TYPES.find((t) => t.value === type);
    setFormData({
      ...formData,
      type,
      slotWidth: typeInfo?.defaultSlotWidth || 1,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={fuse ? 'Edit Breaker' : 'Add Breaker'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Label"
          placeholder="Kitchen Lights, Bathroom RCBO, etc."
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as FuseType)}
            options={FUSE_TYPES.map((t) => ({ value: t.value, label: `${t.label} - ${t.description}` }))}
          />
          <Select
            label="Amperage"
            value={formData.amperage}
            onChange={(e) => setFormData({ ...formData, amperage: parseInt(e.target.value) })}
            options={COMMON_AMPERAGES.map((a) => ({ value: a, label: `${a}A` }))}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          <Select
            label="Slot Width"
            value={formData.slotWidth}
            onChange={(e) => setFormData({ ...formData, slotWidth: parseInt(e.target.value) })}
            options={[1, 2, 3, 4, 5, 6].map((w) => ({ value: w, label: `${w} slot${w > 1 ? 's' : ''}` }))}
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
