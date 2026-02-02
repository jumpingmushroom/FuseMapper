import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';

const router = Router();

const createPanelSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().max(200).optional(),
  mainBreakerAmperage: z.number().int().min(1).max(1000).optional(),
  mainBreakerType: z.string().max(50).optional(),
});

const updatePanelSchema = createPanelSchema.partial();

// Standard includes for panel queries
const panelIncludes = {
  rows: {
    include: {
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
          subPanel: true,
        },
        orderBy: [
          { slotNumber: { sort: 'asc' as const, nulls: 'last' as const } },
          { sortOrder: 'asc' as const },
        ],
      },
    },
    orderBy: { position: 'asc' as const },
  },
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

// GET /api/panels - List all panels
router.get('/', async (_req, res, next) => {
  try {
    const panels = await prisma.panel.findMany({
      include: panelIncludes,
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
        ...panelIncludes,
        parentFuse: {
          include: {
            panel: true,
          },
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

// GET /api/panels/:id/hierarchy - Get panel hierarchy
router.get('/:id/hierarchy', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findUnique({
      where: { id: req.params.id },
      include: {
        parentFuse: {
          include: {
            panel: true,
          },
        },
      },
    });

    if (!panel) {
      throw new ApiError(404, 'Panel not found');
    }

    // Build hierarchy chain from root to current panel
    const hierarchy = [];
    let currentPanel: typeof panel | null = panel;

    // Traverse up to root panel
    while (currentPanel) {
      hierarchy.unshift({
        id: currentPanel.id,
        name: currentPanel.name,
        parentFuseId: currentPanel.parentFuseId,
        feedAmperage: currentPanel.feedAmperage,
      });

      if (currentPanel.parentFuse?.panel) {
        currentPanel = await prisma.panel.findUnique({
          where: { id: currentPanel.parentFuse.panel.id },
          include: {
            parentFuse: {
              include: {
                panel: true,
              },
            },
          },
        });
      } else {
        currentPanel = null;
      }
    }

    res.json({ data: hierarchy, success: true });
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
      include: panelIncludes,
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
      include: panelIncludes,
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

// POST /api/panels/:panelId/fuses - Create fuse (nested route)
const fuseTypeEnum = z.enum(['MCB', 'RCBO', 'RCD', 'MAIN', 'SPD', 'DIN_DEVICE']);
const curveTypeEnum = z.enum(['B', 'C', 'D']).nullable();

const createFuseSchema = z.object({
  panelId: z.string(),
  rowId: z.string().optional(),
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  slotNumber: z.number().int().min(1).max(999).optional(),
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

const fuseIncludes = {
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
};

// Helper function to validate row capacity
async function validateRowCapacity(rowId: string) {
  const row = await prisma.row.findUnique({
    where: { id: rowId },
    include: { _count: { select: { fuses: true } } },
  });

  if (!row) {
    throw new ApiError(404, 'Row not found');
  }

  if (row._count.fuses >= row.maxFuses) {
    throw new ApiError(
      400,
      `Row is full (${row.maxFuses}/${row.maxFuses} fuses). Either increase the row limit or choose a different row.`
    );
  }
}

router.post('/:panelId/fuses', async (req, res, next) => {
  try {
    const data = createFuseSchema.parse({
      ...req.body,
      panelId: req.params.panelId,
    });

    // Validate row capacity if rowId is provided
    if (data.rowId) {
      await validateRowCapacity(data.rowId);
    }

    // Auto-increment sortOrder if not provided
    if (data.sortOrder === undefined) {
      const maxOrder = await prisma.fuse.aggregate({
        where: { panelId: data.panelId },
        _max: { sortOrder: true },
      });
      data.sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    }

    const fuse = await prisma.fuse.create({
      data,
      include: fuseIncludes,
    });
    res.status(201).json({ data: fuse, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/panels/:panelId/rows - Create row
const createRowSchema = z.object({
  panelId: z.string(),
  label: z.string().max(100).optional(),
  position: z.number().int().min(0).optional(),
  maxFuses: z.number().int().min(1).max(50).default(10),
});

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

router.post('/:panelId/rows', async (req, res, next) => {
  try {
    const data = createRowSchema.parse({
      ...req.body,
      panelId: req.params.panelId,
    });

    // Auto-increment position if not provided
    if (data.position === undefined) {
      const maxPosition = await prisma.row.aggregate({
        where: { panelId: data.panelId },
        _max: { position: true },
      });
      data.position = (maxPosition._max.position ?? -1) + 1;
    }

    const row = await prisma.row.create({
      data,
      include: rowIncludes,
    });

    res.status(201).json({ data: row, success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
