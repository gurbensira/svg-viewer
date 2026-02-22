import type { Request, Response } from 'express';
import {
  createDesignFromUpload,
  getAllDesigns,
  getDesignById
} from '../services/design.service';

const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_ERROR = 500;

export const handleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(HTTP_BAD_REQUEST).json({ error: 'No file uploaded' });
      return;
    }

    const design = await createDesignFromUpload(req.file.path, req.file.originalname);
    res.status(HTTP_CREATED).json(design);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    res.status(HTTP_INTERNAL_ERROR).json({ error: message });
  }
};

export const handleGetAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const designs = await getAllDesigns();
    res.json(designs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch designs';
    res.status(HTTP_INTERNAL_ERROR).json({ error: message });
  }
};

export const handleGetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const design = await getDesignById(req.params.id as string);
    if (!design) {
      res.status(HTTP_NOT_FOUND).json({ error: 'Design not found' });
      return;
    }
    res.json(design);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch design';
    res.status(HTTP_INTERNAL_ERROR).json({ error: message });
  }
};
