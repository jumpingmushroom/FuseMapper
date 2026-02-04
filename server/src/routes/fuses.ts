import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { ApiError } from '../middleware/error-handler.js';
import { generateJunctionBoxLabel, generateSocketLabel } from '@fusemapper/shared';

const router = Router();

const fuseTypeEnum = z.enum(['MCB', 'RCBO', 'RCD', 'MAIN', 'SPD', 'DIN_DEVICE']);
const curveTypeEnum = z.enum(['B', 'C', 'D']).nullable();
const spdClassEnum = z.enum(['Type1', 'Type2', 'Type3']).nullable();

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
  // SPD-specific fields
  spdVoltageRating: z.number().int().min(100).max(1000).optional(),
  spdSurgeCurrentRating: z.number().int().min(1).max(200).optional(),
  spdClass: spdClassEnum.optional(),
});

const updateFuseSchema = createFuseSchema.partial().omit({ panelId: true });

// Helper function to validate row capacity
async function validateRowCapacity(rowId: string, excludeFuseId?: string) {
  const row = await prisma.row.findUnique({
    where: { id: rowId },
    include: { _count: { select: { fuses: true } } },
  });

  if (!row) {
    throw new ApiError(404, 'Row not found');
  }

  // Count fuses in row (excluding the fuse being updated if applicable)
  const fuseCount = excludeFuseId
    ? await prisma.fuse.count({
        where: { rowId, id: { not: excludeFuseId } },
      })
    : row._count.fuses;

  if (fuseCount >= row.maxFuses) {
    throw new ApiError(
      400,
      `Row is full (${row.maxFuses}/${row.maxFuses} fuses). Either increase the row limit or choose a different row.`
    );
  }
}

// Standard includes for fuse queries
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
  hardwiredDevices: {
    include: { room: true },
    orderBy: { sortOrder: 'asc' as const },
  },
};

// GET /api/fuses/:id - Get single fuse
router.get('/:id', async (req, res, next) => {
  try {
    const fuse = await prisma.fuse.findUnique({
      where: { id: req.params.id },
      include: fuseIncludes,
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

    // If moving to a new row, validate row capacity
    if (data.rowId) {
      await validateRowCapacity(data.rowId, req.params.id);
    }

    const fuse = await prisma.fuse.update({
      where: { id: req.params.id },
      data,
      include: fuseIncludes,
    });
    res.json({ data: fuse, success: true });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fuses/:id/reorder - Reorder fuse
router.patch('/:id/reorder', async (req, res, next) => {
  try {
    const { sortOrder } = z.object({ sortOrder: z.number().int().min(0) }).parse(req.body);

    const fuse = await prisma.fuse.update({
      where: { id: req.params.id },
      data: { sortOrder },
      include: fuseIncludes,
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

// POST /api/fuses/:fuseId/sockets - Create socket in chain
const createSocketSchema = z.object({
  fuseId: z.string(),
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  roomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

router.post('/:fuseId/sockets', async (req, res, next) => {
  try {
    const data = createSocketSchema.parse({
      ...req.body,
      fuseId: req.params.fuseId,
    });

    // Verify fuse exists
    const fuse = await prisma.fuse.findUnique({
      where: { id: data.fuseId },
    });

    if (!fuse) {
      throw new ApiError(404, 'Fuse not found');
    }

    // Auto-increment sortOrder if not provided
    if (data.sortOrder === undefined) {
      const maxOrder = await prisma.socket.aggregate({
        where: { fuseId: data.fuseId },
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

// POST /api/fuses/:fuseId/junction-boxes - Create junction box
const createJunctionBoxSchema = z.object({
  fuseId: z.string(),
  label: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  roomId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

router.post('/:fuseId/junction-boxes', async (req, res, next) => {
  try {
    const data = createJunctionBoxSchema.parse({
      ...req.body,
      fuseId: req.params.fuseId,
    });

    // Verify fuse exists
    const fuse = await prisma.fuse.findUnique({
      where: { id: data.fuseId },
    });

    if (!fuse) {
      throw new ApiError(404, 'Fuse not found');
    }

    // Auto-increment sortOrder if not provided
    if (data.sortOrder === undefined) {
      const maxOrder = await prisma.junctionBox.aggregate({
        where: { fuseId: data.fuseId },
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

    const junctionBox = await prisma.junctionBox.create({
      data,
      include: {
        sockets: {
          include: {
            devices: {
              include: { room: true },
              orderBy: { sortOrder: 'asc' },
            },
            room: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        devices: {
          include: { room: true },
          orderBy: { sortOrder: 'asc' },
        },
        room: true,
      },
    });
    res.status(201).json({ data: junctionBox, success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/fuses/:fuseId/subpanel - Create sub-panel linked to fuse
const createSubPanelSchema = z.object({
  name: z.string().min(1).max(100),
  feedAmperage: z.number().int().min(1).max(1000),
  location: z.string().max(200).optional(),
});

router.post('/:fuseId/subpanel', async (req, res, next) => {
  try {
    const data = createSubPanelSchema.parse(req.body);
    const fuseId = req.params.fuseId;

    // Verify fuse exists
    const fuse = await prisma.fuse.findUnique({
      where: { id: fuseId },
      include: { subPanel: true },
    });

    if (!fuse) {
      throw new ApiError(404, 'Fuse not found');
    }

    // Check if fuse already has a sub-panel
    if (fuse.subPanel) {
      throw new ApiError(400, 'This fuse already has a sub-panel connected');
    }

    // Validate feed amperage doesn't exceed fuse amperage
    if (fuse.amperage && data.feedAmperage > fuse.amperage) {
      throw new ApiError(
        400,
        `Sub-panel feed amperage (${data.feedAmperage}A) cannot exceed fuse amperage (${fuse.amperage}A)`
      );
    }

    // Create the sub-panel
    const panel = await prisma.panel.create({
      data: {
        name: data.name,
        location: data.location,
        parentFuseId: fuseId,
        feedAmperage: data.feedAmperage,
      },
      include: {
        rows: {
          include: {
            fuses: {
              include: {
                sockets: {
                  include: {
                    devices: {
                      include: { room: true },
                      orderBy: { sortOrder: 'asc' },
                    },
                    room: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        fuses: {
          include: {
            sockets: {
              include: {
                devices: {
                  include: { room: true },
                  orderBy: { sortOrder: 'asc' },
                },
                room: true,
              },
              orderBy: { sortOrder: 'asc' },
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

export default router;
