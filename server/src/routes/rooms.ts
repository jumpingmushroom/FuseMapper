import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6B7280'),
});

const updateRoomSchema = createRoomSchema.partial();

// GET /api/rooms - List all rooms
router.get('/', async (_req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        _count: {
          select: { devices: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ data: rooms, success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/rooms/:id - Get single room
router.get('/:id', async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        devices: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!room) {
      throw new ApiError(404, 'Room not found');
    }

    res.json({ data: room, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/rooms - Create room
router.post('/', async (req, res, next) => {
  try {
    const data = createRoomSchema.parse(req.body);
    const room = await prisma.room.create({ data });
    res.status(201).json({ data: room, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/rooms/:id - Update room
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateRoomSchema.parse(req.body);
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ data: room, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.room.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
