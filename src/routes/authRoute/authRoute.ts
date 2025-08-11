import express,{Router} from 'express'
import errorHandler from '../../services/errorHandler';
import AuthController from '../../controllers/authController/authController';

const router : Router = express.Router();

router.route('/register')
.post(errorHandler(AuthController.registerUser))

router.route('/login')
.post(errorHandler(AuthController.loginUser))

export default router;

