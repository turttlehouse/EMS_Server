import express,{Router} from 'express'
import authMiddleware from '../../middleware/auth/authMiddleware';
import { Role } from '../../middleware/auth/authTypes';
import errorHandler from '../../services/errorHandler';
import UserController from '../../controllers/userController/userController';

const router : Router = express.Router();

router.route('/users')
.get(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(UserController.getUsers))

router.route('/users/:id')
.delete(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(UserController.deleteUser))

router.route('/users/:id/role')
.patch(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(UserController.updateUserRole))


export default router;

