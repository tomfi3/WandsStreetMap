import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRoadHighlightSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get roads within a bounding box
  app.get('/api/roads', async (req, res) => {
    try {
      const { swLat, swLng, neLat, neLng } = req.query;
      
      // Validate parameters
      if (!swLat || !swLng || !neLat || !neLng) {
        return res.status(400).json({ 
          message: 'Missing required parameters: swLat, swLng, neLat, neLng' 
        });
      }
      
      // Convert to numbers
      const bounds = {
        swLat: parseFloat(swLat as string),
        swLng: parseFloat(swLng as string),
        neLat: parseFloat(neLat as string),
        neLng: parseFloat(neLng as string)
      };
      
      // Validate bounds
      if (isNaN(bounds.swLat) || isNaN(bounds.swLng) || 
          isNaN(bounds.neLat) || isNaN(bounds.neLng)) {
        return res.status(400).json({ 
          message: 'Invalid parameters: coordinates must be numbers' 
        });
      }
      
      // Get roads within bounds
      const roads = await storage.getRoadsByBounds(
        bounds.swLat, bounds.swLng, bounds.neLat, bounds.neLng
      );
      
      res.json({ roads });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch roads',
        error: (error as Error).message
      });
    }
  });

  // Save a road highlight
  app.post('/api/highlights', async (req, res) => {
    try {
      // Validate request body
      const result = insertRoadHighlightSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ 
          message: 'Invalid road highlight data',
          errors: validationError.details
        });
      }
      
      // Save the road highlight
      const roadHighlight = await storage.saveRoadHighlight({
        ...result.data,
        createdAt: new Date().toISOString()
      });
      
      res.status(201).json(roadHighlight);
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to save road highlight',
        error: (error as Error).message
      });
    }
  });

  // Get all road highlights
  app.get('/api/highlights', async (req, res) => {
    try {
      const highlights = await storage.getRoadHighlights();
      res.json({ highlights });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to fetch road highlights',
        error: (error as Error).message
      });
    }
  });

  // Delete a road highlight
  app.delete('/api/highlights/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID parameter' });
      }
      
      const deleted = await storage.deleteRoadHighlight(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Road highlight not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to delete road highlight',
        error: (error as Error).message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
