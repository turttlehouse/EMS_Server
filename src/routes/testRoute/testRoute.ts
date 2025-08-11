import express,{Router} from 'express'
import authMiddleware from '../../middleware/auth/authMiddleware';
import { Role } from '../../middleware/auth/authTypes';
import errorHandler from '../../services/errorHandler';
import TestController from '../../controllers/testController/testController';


const router : Router = express.Router();

router.route('/create-test')
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin,Role.Teacher),errorHandler(TestController.createTest))

router.route('/tests')
.get(authMiddleware.isAuthenticated,errorHandler(TestController.getAllTests))


export default router;

