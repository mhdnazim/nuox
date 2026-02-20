import { Router } from 'express';
import {
    getTeachers,
    getTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher,
} from '../controllers/teachers.controller';

const router = Router();

router.route('/')
    .get(getTeachers)
    .post(addTeacher);

router.route('/:id')
    .get(getTeacher)
    .put(updateTeacher)
    .delete(deleteTeacher);

export default router;
