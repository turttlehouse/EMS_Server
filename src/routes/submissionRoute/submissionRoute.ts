import express,{ Router } from "express";
import authMiddleware from "../../middleware/auth/authMiddleware";
import { Role } from "../../middleware/auth/authTypes";
import errorHandler from "../../services/errorHandler";
import SubmissionController from "../../controllers/submissionController/submissionController";


const router : Router = express.Router();

router.route('/')
.get(authMiddleware.isAuthenticated, authMiddleware.authorizeTo(Role.Admin,Role.Teacher), errorHandler(SubmissionController.getAllTestSubmissions));

router.route('/submit-test')
.post(authMiddleware.isAuthenticated, authMiddleware.authorizeTo(Role.Student), errorHandler(SubmissionController.submitTest));

router.route('/my-results')
.get(authMiddleware.isAuthenticated, authMiddleware.authorizeTo(Role.Student), errorHandler(SubmissionController.getStudentOwnResults));

router.route('/release-scores')
.get(authMiddleware.isAuthenticated, authMiddleware.authorizeTo(Role.Admin,Role.Teacher), errorHandler(SubmissionController.releaseScores));

router.route('/view-test-submissions/:testId')
.get(authMiddleware.isAuthenticated, authMiddleware.authorizeTo(Role.Admin,Role.Teacher), errorHandler(SubmissionController.getAllTestSubmissions));

export default router;
