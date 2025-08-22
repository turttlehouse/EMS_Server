import express,{ Router } from "express";
import authMiddleware from "../../middleware/auth/authMiddleware";
import QuestionController from "../../controllers/questionController/questionController";
import { Role } from "../../middleware/auth/authTypes";
import errorHandler from "../../services/errorHandler";


const router : Router = express.Router();

router.route('/create-questions')
.post(authMiddleware.isAuthenticated, authMiddleware.restrictTo(Role.Admin,Role.Teacher), errorHandler(QuestionController.createQuestions));

export default router;
