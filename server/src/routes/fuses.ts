import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const fuseTypeEnum = z.enum(['MCB', 'RCBO', 'RCD', 'MAIN', 'SPD', 'DIN_DEVICE']);
const curveTypeEnum = z.enum(['B', 'C', 'D']).nullable();

const createFuseSchema = z.object({
  panelId: z.string(),
  label: z.string().max(100).optional(),
  row: z.number().int().min(0),
  slotStart: z.number().int().min(0),
  slotWidth: z.number().int().min(1).max(6).default(1),
  poles: z.number().int().min(1).max(4).default(1),
  amperage: z.number().int().min(1).max(125).optional(),
  type: fuseTypeEnum.default('MCB'),
  curveType: curveTypeEnum.optional(),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  color: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  deviceUrl: z.string().url().max(500).optional(),
});

const updateFuseSchema = createFuseSchema.partial().omit({ panelId: true });

// POST /api/panels/:panelId/fuses - Create fuse (nested route)
router.post('/panels/:panelId/fuses', async (req, res, next) => {
  try {
    const data = createFuseSchema.parse({
      ...req.body,
      panelId: req.params.panelId,
    });

    // Check for overlapping fuses
    const existingFuses = await prisma.fuse.findMany({
      where: {
        panelId: data.panelId,
        row: data.row,
      },
    });

    const newSlotEnd = data.slotStart + data.slotWidth - 1;
    for (const fuse of existingFuses) {
      const existingSlotEnd = fuse.slotStart + fuse.slotWidth - 1;
      if (
        data.slotStart <= existingSlotEnd &&
        newSlotEnd >= fuse.slotStart
      ) {
        throw new ApiError(400, 'Fuse overlaps with existing fuse');
      }
    }

    const fuse = await prisma.fuse.create({
      data,
      include: {
        devices: {
          include: { room: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.status(201).json({ data: fuse, success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/fuses/:id - Get single fuse
router.get('/:id', async (req, res, next) => {
  try {
    const fuse = await prisma.fuse.findUnique({
      where: { id: req.params.id },
      include: {
        devices: {
          include: { room: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!fuse) {
      throw new ApiError(404, 'Fuse not found');
    }

    res.json({ data: fuse, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fuses/:id - Update fuse
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateFuseSchema.parse(req.body);

    // If position is changing, check for overlaps
    if (data.row !== undefined || data.slotStart !== undefined || data.slotWidth !== undefined) {
      const existing = await prisma.fuse.findUnique({
        where: { id: req.params.id },
      });

      if (!existing) {
        throw new ApiError(404, 'Fuse not found');
      }

      const newRow = data.row ?? existing.row;
      const newSlotStart = data.slotStart ?? existing.slotStart;
      const newSlotWidth = data.slotWidth ?? existing.slotWidth;
      const newSlotEnd = newSlotStart + newSlotWidth - 1;

      const otherFuses = await prisma.fuse.findMany({
        where: {
          panelId: existing.panelId,
          row: newRow,
          id: { not: req.params.id },
        },
      });

      for (const fuse of otherFuses) {
        const existingSlotEnd = fuse.slotStart + fuse.slotWidth - 1;
        if (newSlotStart <= existingSlotEnd && newSlotEnd >= fuse.slotStart) {
          throw new ApiError(400, 'Fuse overlaps with existing fuse');
        }
      }
    }

    const fuse = await prisma.fuse.update({
      where: { id: req.params.id },
      data,
      include: {
        devices: {
          include: { room: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    res.json({ data: fuse, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/fuses/:id - Delete fuse
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.fuse.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
