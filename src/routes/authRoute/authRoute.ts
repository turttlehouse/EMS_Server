import express,{Router} from 'express'
import errorHandler from '../../services/errorHandler';
import AuthController from '../../controllers/authController/authController';
import authMiddleware from '../../middleware/auth/authMiddleware';
import { Role } from '../../middleware/auth/authTypes';

const router : Router = express.Router();

router.route('/register')
.post(errorHandler(AuthController.registerUser))

router.route('/login')
.post(errorHandler(AuthController.loginUser))

router.route('/users')
.get(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(AuthController.getUsers))

router.route('/users/:id')
.delete(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(AuthController.deleteUser))
.patch(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(AuthController.updateUserRole))

// router.route('/users/:id/role')

export default router;

