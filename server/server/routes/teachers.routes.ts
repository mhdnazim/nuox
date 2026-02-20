import { Router } from 'express';
import {
    getTeachers,
    getTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachers,
} from '../controllers/teachers.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.route('/')
    .get(getTeachers)
    .post(addTeacher);

router.post('/import', authMiddleware, upload.fields([
    { name: 'csvData', maxCount: 1 },
    { name: 'imagesZip', maxCount: 1 }
]), importTeachers);

router.route('/:id')
    .get(getTeacher)
    .put(updateTeacher)
    .delete(deleteTeacher);

export default router;
