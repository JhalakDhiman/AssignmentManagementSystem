import { Router } from "express";
import { checkUserGroupStatus, createGroup, getEligibleStudentsForGroup } from "../controllers/group.js";
import {auth,isStudent} from '../middlewares/auth.js'

const router = Router();

router.post('/createGroup',auth,isStudent,createGroup);
router.get('/getEligibleStudentsForGroup/:assignmentId',getEligibleStudentsForGroup)
router.get('/checkUserGroupStatus/:assignmentId',auth,isStudent,checkUserGroupStatus);

export default router;