import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const createPanelSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  rows: z.number().int().min(1).max(20).default(3),
  slotsPerRow: z.number().int().min(1).max(24).default(12),
});

const updatePanelSchema = createPanelSchema.partial();

// GET /api/panels - List all panels
router.get('/', async (_req, res, next) => {
  try {
    const panels = await prisma.panel.findMany({
      include: {
        fuses: {
          include: {
            devices: {
              include: { room: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [{ row: 'asc' }, { slotStart: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: panels, success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/panels/:id - Get single panel
router.get('/:id', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findUnique({
      where: { id: req.params.id },
      include: {
        fuses: {
          include: {
            devices: {
              include: { room: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [{ row: 'asc' }, { slotStart: 'asc' }],
        },
      },
    });

    if (!panel) {
      throw new ApiError(404, 'Panel not found');
    }

    res.json({ data: panel, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/panels - Create panel
router.post('/', async (req, res, next) => {
  try {
    const data = createPanelSchema.parse(req.body);
    const panel = await prisma.panel.create({
      data,
      include: {
        fuses: {
          include: {
            devices: {
              include: { room: true },
            },
          },
        },
      },
    });
    res.status(201).json({ data: panel, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/panels/:id - Update panel
router.patch('/:id', async (req, res, next) => {
  try {
    const data = updatePanelSchema.parse(req.body);
    const panel = await prisma.panel.update({
      where: { id: req.params.id },
      data,
      include: {
        fuses: {
          include: {
            devices: {
              include: { room: true },
            },
          },
        },
      },
    });
    res.json({ data: panel, success: true });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/panels/:id - Delete panel
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.panel.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
