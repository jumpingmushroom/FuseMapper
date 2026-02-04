import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';
import { generateSocketLabel } from '@fusemapper/shared';

const router = Router();

const updateSocketSchema = z.object({
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  roomId: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
});

// Standard includes for socket queries
const socketIncludes = {
  devices: {
    include: { room: true },
    orderBy: { sortOrder: 'asc' as const },
  },
  room: true,
};

// GET /api/sockets/:id - Get socket with devices
router.get('/:id', async (req, res, next) => {
  try {
    const socket = await prisma.socket.findUnique({
      where: { id: req.params.id },
      include: socketIncludes,
    });

    if (!socket) {
      throw new ApiError(404, 'Socket not found');
    }

    res.json({ data: socket, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sockets/:id - Update socket
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateSocketSchema.parse(req.body);

    // Get current socket to check if label is empty
    const currentSocket = await prisma.socket.findUnique({
      where: { id: req.params.id },
    });

    if (!currentSocket) {
      throw new ApiError(404, 'Socket not found');
    }

    // Auto-generate label if currently empty and room is being assigned
    if (!currentSocket.label && !data.label && data.roomId) {
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

    const socket = await prisma.socket.update({
      where: { id: req.params.id },
      data,
      include: socketIncludes,
    });
    res.json({ data: socket, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sockets/:id/reorder - Reorder socket in chain
router.patch('/:id/reorder', async (req, res, next) => {
  try {
    const { sortOrder } = z.object({ sortOrder: z.number().int().min(0) }).parse(req.body);

    const socket = await prisma.socket.update({
      where: { id: req.params.id },
      data: { sortOrder },
      include: socketIncludes,
    });
    res.json({ data: socket, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sockets/:id - Delete socket
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.socket.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
