import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// Get traffic segments within a bounding box
router.get('/segments', async (req, res) => {
  try {
    const { bbox } = req.query;
    
    if (!bbox || typeof bbox !== 'string') {
      return res.status(400).json({ error: 'bbox parameter required' });
    }

    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
    
    // Mock data for now - replace with actual DB query
    const mockSegments = [
      {
        id: '1',
        coordinates: [[40.7128, -74.0060], [40.7148, -74.0080]] as [number, number][],
        speed: 45.5,
        congestionLevel: 'low' as const,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        coordinates: [[40.7200, -74.0100], [40.7220, -74.0120]] as [number, number][],
        speed: 25.3,
        congestionLevel: 'medium' as const,
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        coordinates: [[40.7280, -74.0150], [40.7300, -74.0170]] as [number, number][],
        speed: 8.7,
        congestionLevel: 'severe' as const,
        timestamp: new Date().toISOString(),
      },
    ];

    return res.json(mockSegments);
  } catch (err) {
    console.error('Error fetching segments:', err);
    return res.status(500).json({ error: 'Failed to fetch traffic segments' });
  }
});

export default router;
