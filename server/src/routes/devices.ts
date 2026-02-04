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
  socketId: z.string().optional(),
  fuseId: z.string().optional(),
  junctionBoxId: z.string().optional(),
  name: z.string().min(1).max(100),
  icon: iconEnum.default('generic'),
  category: categoryEnum.default('other'),
  roomId: z.string().optional().nullable(),
  estimatedWattage: z.number().int().min(0).max(50000).optional().nullable(),
  isHardwired: z.boolean().default(false),
  notes: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

const updateDeviceSchema = createDeviceSchema.partial();

const moveDeviceSchema = z.object({
  socketId: z.string().optional().nullable(),
  fuseId: z.string().optional().nullable(),
  junctionBoxId: z.string().optional().nullable(),
  isHardwired: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// GET /api/devices - List all devices
router.get('/', async (req, res, next) => {
  try {
    const { socketId, unassigned } = req.query;

    const where: Record<string, unknown> = {};
    if (socketId) {
      where.socketId = socketId as string;
    }
    if (unassigned === 'true') {
      // A device is unassigned only if it has no parent (socket, fuse, or junction box)
      where.AND = [
        { socketId: null },
        { fuseId: null },
        { junctionBoxId: null }
      ];
    }

    const devices = await prisma.device.findMany({
      where,
      include: { room: true },
      orderBy: [{ socketId: 'asc' }, { sortOrder: 'asc' }],
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

    // Validate: device can only have one parent (socket, fuse, or junction box)
    // Exception: socketId + isHardwired is allowed (device hardwired from a socket)
    const parentCount = [data.socketId, data.fuseId, data.junctionBoxId].filter(Boolean).length;
    if (parentCount > 1 && !(data.socketId && data.isHardwired && parentCount === 1)) {
      throw new ApiError(400, 'Device can only have one parent (socketId, fuseId, or junctionBoxId)');
    }

    // Get max sortOrder for the target socket, fuse, or junction box
    if (data.socketId && data.sortOrder === 0) {
      const maxOrder = await prisma.device.aggregate({
        where: { socketId: data.socketId },
        _max: { sortOrder: true },
      });
      data.sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (data.fuseId && data.sortOrder === 0) {
      const maxOrder = await prisma.device.aggregate({
        where: { fuseId: data.fuseId },
        _max: { sortOrder: true },
      });
      data.sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (data.junctionBoxId && data.sortOrder === 0) {
      const maxOrder = await prisma.device.aggregate({
        where: { junctionBoxId: data.junctionBoxId },
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

// PATCH /api/devices/:id/move - Move device to different socket, fuse, or junction box
router.patch('/:id/move', async (req, res, next) => {
  try {
    const { socketId, fuseId, junctionBoxId, isHardwired, sortOrder } = moveDeviceSchema.parse(req.body);

    // Validate: device can only have one parent
    // Exception: socketId + isHardwired is allowed
    const parentCount = [socketId, fuseId, junctionBoxId].filter(id => id !== null && id !== undefined).length;
    if (parentCount > 1 && !(socketId && isHardwired && parentCount === 1)) {
      throw new ApiError(400, 'Device can only have one parent (socketId, fuseId, or junctionBoxId)');
    }

    let newSortOrder = sortOrder;

    // If sortOrder not provided, put at end
    if (newSortOrder === undefined && socketId) {
      const maxOrder = await prisma.device.aggregate({
        where: { socketId },
        _max: { sortOrder: true },
      });
      newSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (newSortOrder === undefined && fuseId) {
      const maxOrder = await prisma.device.aggregate({
        where: { fuseId },
        _max: { sortOrder: true },
      });
      newSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (newSortOrder === undefined && junctionBoxId) {
      const maxOrder = await prisma.device.aggregate({
        where: { junctionBoxId },
        _max: { sortOrder: true },
      });
      newSortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    } else if (newSortOrder === undefined) {
      newSortOrder = 0;
    }

    const device = await prisma.device.update({
      where: { id: req.params.id },
      data: {
        socketId: socketId !== undefined ? socketId : undefined,
        fuseId: fuseId !== undefined ? fuseId : undefined,
        junctionBoxId: junctionBoxId !== undefined ? junctionBoxId : undefined,
        isHardwired: isHardwired !== undefined ? isHardwired : undefined,
        sortOrder: newSortOrder
      },
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
