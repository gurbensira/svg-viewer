import { Router } from 'express';
import { svgUpload } from '../middleware/upload.middleware';
import { handleUpload, handleGetAll, handleGetById } from '../controllers/design.controller';

const router = Router();

router.post('/upload', svgUpload.single('file'), handleUpload);
router.get('/', handleGetAll);
router.get('/:id', handleGetById);

export default router;
