import { Router } from "express";
import { addAssignment, checkIsAssignmentSubmitted, getAssignmentForStudent, getAssignmentsForCourse, submitAssignment } from "../controllers/assignment.js";
import { auth, isProfessor, isStudent } from "../middlewares/auth.js";

const router = Router();

router.post('/addAssignment',auth,isProfessor,addAssignment);
router.post('/submitAssignment/:assignmentId',auth,isStudent,submitAssignment);
router.get('/getAssignmentsForCourse/:courseId',auth,isProfessor,getAssignmentsForCourse);
router.get('/getAssignmentForStudent',getAssignmentForStudent);
router.get('/checkIsAssignmentSubmitted/:assignmentId',auth,isStudent,checkIsAssignmentSubmitted)

export default router;