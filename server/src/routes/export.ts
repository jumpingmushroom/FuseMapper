import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import type { ExportData, ImportResult } from '@fusemapper/shared';

const router = Router();

// GET /api/export - Export all data
router.get('/export', async (_req, res, next) => {
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

    const rooms = await prisma.room.findMany({
      orderBy: { name: 'asc' },
    });

    const unassignedDevices = await prisma.device.findMany({
      where: { fuseId: null },
      include: { room: true },
      orderBy: { name: 'asc' },
    });

    const exportData: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      panels: panels as ExportData['panels'],
      rooms: rooms as ExportData['rooms'],
      unassignedDevices: unassignedDevices as ExportData['unassignedDevices'],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fusemapper-export-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Import validation schema
const importSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  panels: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    location: z.string().nullable().optional(),
    rows: z.number(),
    slotsPerRow: z.number(),
    fuses: z.array(z.object({
      id: z.string().optional(),
      label: z.string().nullable().optional(),
      row: z.number(),
      slotStart: z.number(),
      slotWidth: z.number(),
      poles: z.number(),
      amperage: z.number().nullable().optional(),
      type: z.string(),
      curveType: z.string().nullable().optional(),
      manufacturer: z.string().nullable().optional(),
      model: z.string().nullable().optional(),
      isActive: z.boolean(),
      color: z.string().nullable().optional(),
      notes: z.string().nullable().optional(),
      deviceUrl: z.string().nullable().optional(),
      devices: z.array(z.object({
        id: z.string().optional(),
        name: z.string(),
        icon: z.string(),
        category: z.string(),
        roomId: z.string().nullable().optional(),
        estimatedWattage: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
        sortOrder: z.number(),
      })).optional(),
    })).optional(),
  })),
  rooms: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    color: z.string(),
  })),
  unassignedDevices: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    icon: z.string(),
    category: z.string(),
    roomId: z.string().nullable().optional(),
    estimatedWattage: z.number().nullable().optional(),
    notes: z.string().nullable().optional(),
    sortOrder: z.number(),
  })).optional(),
});

// POST /api/import - Import data
router.post('/import', async (req, res, next) => {
  try {
    const data = importSchema.parse(req.body);
    const result: ImportResult = {
      success: true,
      panelsImported: 0,
      fusesImported: 0,
      devicesImported: 0,
      roomsImported: 0,
      errors: [],
    };

    // Map old room IDs to new IDs
    const roomIdMap = new Map<string, string>();

    // Import rooms first
    for (const room of data.rooms) {
      try {
        const newRoom = await prisma.room.create({
          data: {
            name: room.name,
            color: room.color,
          },
        });
        if (room.id) {
          roomIdMap.set(room.id, newRoom.id);
        }
        result.roomsImported++;
      } catch (error) {
        result.errors.push(`Failed to import room "${room.name}": ${error}`);
      }
    }

    // Import panels with fuses and devices
    for (const panel of data.panels) {
      try {
        const newPanel = await prisma.panel.create({
          data: {
            name: panel.name,
            location: panel.location,
            rows: panel.rows,
            slotsPerRow: panel.slotsPerRow,
          },
        });
        result.panelsImported++;

        // Import fuses
        for (const fuse of panel.fuses ?? []) {
          try {
            const newFuse = await prisma.fuse.create({
              data: {
                panelId: newPanel.id,
                label: fuse.label,
                row: fuse.row,
                slotStart: fuse.slotStart,
                slotWidth: fuse.slotWidth,
                poles: fuse.poles,
                amperage: fuse.amperage,
                type: fuse.type,
                curveType: fuse.curveType,
                manufacturer: fuse.manufacturer,
                model: fuse.model,
                isActive: fuse.isActive,
                color: fuse.color,
                notes: fuse.notes,
                deviceUrl: fuse.deviceUrl,
              },
            });
            result.fusesImported++;

            // Import devices on this fuse
            for (const device of fuse.devices ?? []) {
              try {
                await prisma.device.create({
                  data: {
                    fuseId: newFuse.id,
                    name: device.name,
                    icon: device.icon,
                    category: device.category,
                    roomId: device.roomId ? roomIdMap.get(device.roomId) ?? null : null,
                    estimatedWattage: device.estimatedWattage,
                    notes: device.notes,
                    sortOrder: device.sortOrder,
                  },
                });
                result.devicesImported++;
              } catch (error) {
                result.errors.push(`Failed to import device "${device.name}": ${error}`);
              }
            }
          } catch (error) {
            result.errors.push(`Failed to import fuse "${fuse.label}": ${error}`);
          }
        }
      } catch (error) {
        result.errors.push(`Failed to import panel "${panel.name}": ${error}`);
      }
    }

    // Import unassigned devices
    for (const device of data.unassignedDevices ?? []) {
      try {
        await prisma.device.create({
          data: {
            fuseId: null,
            name: device.name,
            icon: device.icon,
            category: device.category,
            roomId: device.roomId ? roomIdMap.get(device.roomId) ?? null : null,
            estimatedWattage: device.estimatedWattage,
            notes: device.notes,
            sortOrder: device.sortOrder,
          },
        });
        result.devicesImported++;
      } catch (error) {
        result.errors.push(`Failed to import device "${device.name}": ${error}`);
      }
    }

    result.success = result.errors.length === 0;
    res.json({ data: result, success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
