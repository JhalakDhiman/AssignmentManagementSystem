import { Router } from "express";
import { createCourse, enrollStudentInCourse, getAllCourses, getCourseDetails, getProfessorCourses, updateCourse } from "../controllers/course.js";

const router = Router();

router.post('/createCourse',createCourse);
router.post('/updateCourse',updateCourse);
router.get('/getProfessorCourses/:professorId',getProfessorCourses);
router.get('/getAllCourses', getAllCourses)
router.post('/enrollStudent',enrollStudentInCourse);
router.get('/getCourseDetails/:courseId', getCourseDetails)

export default router;