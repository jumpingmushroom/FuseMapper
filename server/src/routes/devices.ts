import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const categoryEnum = z.enum(['appliance', 'lighting', 'outlet', 'heating', 'other']);
const iconEnum = z.enum([
  'dishwasher', 'washing-machine', 'oven', 'fridge', 'microwave', 'dryer', 'freezer', 'hood',
  'ceiling-light', 'lamp', 'led-strip', 'outdoor-light',
  'wall-outlet', 'kitchen-outlet',
  'floor-heating', 'water-heater', 'heat-pump', 'radiator',
  'ev-charger', 'alarm', 'router', 'server', 'tv', 'computer', 'generic'
]);

const createDeviceSchema = z.object({
  fuseId: z.string().optional(),
  name: z.string().min(1).max(100),
  icon: iconEnum.default('generic'),
  category: categoryEnum.default('other'),
  roomId: z.string().optional().nullable(),
  estimatedWattage: z.number().int().min(0).max(50000).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

const updateDeviceSchema = createDeviceSchema.partial();

const moveDeviceSchema = z.object({
  fuseId: z.string().nullable(),
  sortOrder: z.number().int().optional(),
});

// GET /api/devices - List all devices
router.get('/', async (req, res, next) => {
  try {
    const { fuseId, unassigned } = req.query;

    const where: Record<string, unknown> = {};
    if (fuseId) {
      where.fuseId = fuseId as string;
    }
    if (unassigned === 'true') {
      where.fuseId = null;
    }

    const devices = await prisma.device.findMany({
      where,
      include: { room: true },
      orderBy: [{ fuseId: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json({ data: devices, success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/devices/:id - Get single device
router.get('/:id', async (req, res, next) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: req.params.id },
      include: { room: true },
    });

    if (!device) {
      throw new ApiError(404, 'Device not found');
    }

    res.json({ data: device, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/devices - Create device
router.post('/', async (req, res, next) => {
  try {
    const data = createDeviceSchema.parse(req.body);

    // Get max sortOrder for the target fuse
    if (data.fuseId && data.sortOrder === 0) {
      const maxOrder = await prisma.device.aggregate({
        where: { fuseId: data.fuseId },
        _max: { sortOrder: true },
      });
      data.sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    }

    const device = await prisma.device.create({
      data,
      include: { room: true },
    });
    res.status(201).json({ data: device, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/devices/:id - Update device
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateDeviceSchema.parse(req.body);
    const device = await prisma.device.update({
      where: { id: req.params.id },
      data,
      include: { room: true },
    });
    res.json({ data: device, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/devices/:id/move - Move device to different fuse
router.patch('/:id/move', async (req, res, next) => {
  try {
    const { fuseId, sortOrder } = moveDeviceSchema.parse(req.body);

    let newSortOrder = sortOrder;

    // If sortOrder not provided, put at end
    if (newSortOrder === undefined && fuseId) {
      const maxOrder = await prisma.device.aggregate({
        where: { fuseId },
        _max: { sortOrder: true },
      });
      newSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (newSortOrder === undefined) {
      newSortOrder = 0;
    }

    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: { fuseId, sortOrder: newSortOrder },
      include: { room: true },
    });
    res.json({ data: device, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/devices/:id - Delete device
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.device.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
