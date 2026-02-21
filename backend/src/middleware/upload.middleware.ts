import multer from 'multer';
import path from 'path';
import type { Request } from 'express';

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? './uploads';
const SVG_MIME_TYPE = 'image/svg+xml';
const SVG_EXTENSION = '.svg';

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOADS_DIR);
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);
    callback(null, `${path.basename(file.originalname, extension)}-${uniqueSuffix}${extension}`);
  }
});

const svgFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isSvg = file.mimetype === SVG_MIME_TYPE || extension === SVG_EXTENSION;
  if (isSvg) {
    callback(null, true);
  } else {
    callback(new Error('Only .svg files are accepted'));
  }
};

export const svgUpload = multer({ storage, fileFilter: svgFileFilter });
