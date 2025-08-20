import express,{Router} from 'express'
import authMiddleware from '../../middleware/auth/authMiddleware';
import { Role } from '../../middleware/auth/authTypes';
import errorHandler from '../../services/errorHandler';
import TestController from '../../controllers/testController/testController';


const router : Router = express.Router();

router.route('/')
.get(authMiddleware.isAuthenticated,errorHandler(TestController.getAllTests))

router.route('/create-test')
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin,Role.Teacher),errorHandler(TestController.createTest))

router.route('/:id/start')
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Student),errorHandler(TestController.startTest))

router.route('/:id/questions')
.get(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Student),errorHandler(TestController.getTestQuestions))


export default router;

