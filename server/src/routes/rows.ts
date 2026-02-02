import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const updateRowSchema = z.object({
  label: z.string().max(100).optional().nullable(),
  position: z.number().int().min(0).optional(),
  maxFuses: z.number().int().min(1).max(50).optional(),
});

// Standard includes for row queries
const rowIncludes = {
  fuses: {
    include: {
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
    },
    orderBy: [
      { slotNumber: { sort: 'asc' as const, nulls: 'last' as const } },
      { sortOrder: 'asc' as const },
    ],
  },
};

// GET /api/rows/:id - Get single row
router.get('/:id', async (req, res, next) => {
  try {
    const row = await prisma.row.findUnique({
      where: { id: req.params.id },
      include: rowIncludes,
    });

    if (!row) {
      throw new ApiError(404, 'Row not found');
    }

    res.json({ data: row, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/rows/:id - Update row
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updateRowSchema.parse(req.body);

    const row = await prisma.row.update({
      where: { id: req.params.id },
      data,
      include: rowIncludes,
    });

    res.json({ data: row, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/rows/:id/reorder - Reorder row
router.patch('/:id/reorder', async (req, res, next) => {
  try {
    const { position } = z.object({ position: z.number().int().min(0) }).parse(req.body);

    const row = await prisma.row.update({
      where: { id: req.params.id },
      data: { position },
      include: rowIncludes,
    });

    res.json({ data: row, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/rows/:id - Delete row
router.delete('/:id', async (req, res, next) => {
  try {
    // Check if row has fuses
    const row = await prisma.row.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { fuses: true } } },
    });

    if (!row) {
      throw new ApiError(404, 'Row not found');
    }

    if (row._count.fuses > 0) {
      throw new ApiError(400, 'Cannot delete row with fuses. Remove or reassign fuses first.');
    }

    await prisma.row.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
