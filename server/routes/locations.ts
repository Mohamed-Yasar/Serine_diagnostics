import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

// GET all locations
router.get('/', async (_req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
    });
  }
});

// GET one location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error fetching location:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch location',
    });
  }
});

export default router;