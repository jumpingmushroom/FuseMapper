import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';
import { generateSocketLabel, generateJunctionBoxLabel } from '@fusemapper/shared';

const router = Router();

const updateJunctionBoxSchema = z.object({
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  roomId: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
});

// Standard includes for junction box queries
const junctionBoxIncludes = {
  sockets: {
    include: {
      devices: {
        include: { room: true },
        orderBy: { sortOrder: 'asc' as const },
      },
      room: true,
    },
    orderBy: { sortOrder: 'asc' as const },
  },
  devices: {
    include: { room: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  room: true,
};

// GET /api/junction-boxes/:id - Get junction box with sockets and devices
router.get('/:id', async (req, res, next) => {
  try {
    const junctionBox = await prisma.junctionBox.findUnique({
      where: { id: req.params.id },
      include: junctionBoxIncludes,
    });

    if (!junctionBox) {
      throw new ApiError(404, 'Junction box not found');
    }

    res.json({ data: junctionBox, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/junction-boxes/:id - Update junction box
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateJunctionBoxSchema.parse(req.body);

    // Get current junction box to check if label is empty
    const currentJunctionBox = await prisma.junctionBox.findUnique({
      where: { id: req.params.id },
    });

    if (!currentJunctionBox) {
      throw new ApiError(404, 'Junction box not found');
    }

    // Auto-generate label if currently empty and room is being assigned
    if (!currentJunctionBox.label && !data.label && data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
      });

      if (room) {
        // Count existing junction boxes in this room
        const roomJunctionBoxCount = await prisma.junctionBox.count({
          where: { roomId: data.roomId },
        });

        data.label = generateJunctionBoxLabel(
          room.code,
          room.name,
          roomJunctionBoxCount + 1
        );
      }
    }

    const junctionBox = await prisma.junctionBox.update({
      where: { id: req.params.id },
      data,
      include: junctionBoxIncludes,
    });
    res.json({ data: junctionBox, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/junction-boxes/:id/reorder - Reorder junction box in chain
router.patch('/:id/reorder', async (req, res, next) => {
  try {
    const { sortOrder } = z.object({ sortOrder: z.number().int().min(0) }).parse(req.body);

    const junctionBox = await prisma.junctionBox.update({
      where: { id: req.params.id },
      data: { sortOrder },
      include: junctionBoxIncludes,
    });
    res.json({ data: junctionBox, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/junction-boxes/:id - Delete junction box
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.junctionBox.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/junction-boxes/:junctionBoxId/sockets - Create socket connected to junction box
const createSocketSchema = z.object({
  junctionBoxId: z.string(),
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  roomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

router.post('/:junctionBoxId/sockets', async (req, res, next) => {
  try {
    const data = createSocketSchema.parse({
      ...req.body,
      junctionBoxId: req.params.junctionBoxId,
    });

    // Verify junction box exists
    const junctionBox = await prisma.junctionBox.findUnique({
      where: { id: data.junctionBoxId },
    });

    if (!junctionBox) {
      throw new ApiError(404, 'Junction box not found');
    }

    // Auto-increment sortOrder if not provided
    if (data.sortOrder === undefined) {
      const maxOrder = await prisma.socket.aggregate({
        where: { junctionBoxId: data.junctionBoxId },
        _max: { sortOrder: true },
      });
      data.sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    }

    // Auto-generate label if not provided and room is assigned
    if (!data.label && data.roomId) {
      const room = await prisma.room.findUnique({
        where: { id: data.roomId },
      });

      if (room) {
        // Count existing sockets in this room
        const roomSocketCount = await prisma.socket.count({
          where: { roomId: data.roomId },
        });

        data.label = generateSocketLabel(
          room.code,
          room.name,
          roomSocketCount + 1
        );
      }
    }

    const socket = await prisma.socket.create({
      data,
      include: {
        devices: {
          include: { room: true },
          orderBy: { sortOrder: 'asc' },
        },
        room: true,
      },
    });
    res.status(201).json({ data: socket, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/junction-boxes/:junctionBoxId/devices - Create hardwired device on junction box
const createDeviceSchema = z.object({
  junctionBoxId: z.string(),
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  estimatedWattage: z.number().int().min(0).optional(),
  roomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

router.post('/:junctionBoxId/devices', async (req, res, next) => {
  try {
    const data = createDeviceSchema.parse({
      ...req.body,
      junctionBoxId: req.params.junctionBoxId,
    });

    // Verify junction box exists
    const junctionBox = await prisma.junctionBox.findUnique({
      where: { id: data.junctionBoxId },
    });

    if (!junctionBox) {
      throw new ApiError(404, 'Junction box not found');
    }

    // Auto-increment sortOrder
    const maxOrder = await prisma.device.aggregate({
      where: { junctionBoxId: data.junctionBoxId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const device = await prisma.device.create({
      data: {
        ...data,
        sortOrder,
        isHardwired: true,
      },
      include: { room: true },
    });
    res.status(201).json({ data: device, success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
