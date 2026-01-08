import { Router } from 'express';
import { uploadImage } from '../storage/index.js';
import multer from 'multer';

const router = Router();
const upload = multer();

router.post('', upload.single('file'), uploadImage);

export default router;
