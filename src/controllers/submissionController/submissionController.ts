import { Response,NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth/authTypes";
import Submission from "../../database/models/submissionModel";
import StudentAnswer from "../../database/models/studentAnswerModel";
import Option from "../../database/models/optionModel";
import Question from "../../database/models/questionModel";
import { Op } from "sequelize";
import User from "../../database/models/userModel";

interface QuestionWithOptions extends Question {
    options?: Option[];
}


class SubmissionController{

    // submit test method
    public static async submitTest(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        const { submissionId,answers } = req.body;

        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            });
            return;
        }

        if(!submissionId || !Array.isArray(answers) || answers.length === 0){
            res.status(400).json({
                message: 'submission id and answers are required'
            });
            return;
        }

        // find the submission record
        const submission = await Submission.findByPk(submissionId);
        
        if(!submission){
            res.status(404).json({
                message: 'submission not found'
            });
            return;
        }

        if(submission.studentId !== req.user.id){
            res.status(403).json({
                message: 'you cannot submit for other users'
            });
            return;
        }

        // delete previous student answers for this submission(if any)
        await StudentAnswer.destroy({
            where : { submissionId }
        })

        // insert new student answers
        for (const ans of answers){
            const { questionId, selectedOptionId }=ans;

            await StudentAnswer.create({
                submissionId,
                studentId: req.user.id,
                questionId,
                selectedOptionId,
                answeredAt : new Date()
            })
        }


        // calculate score
        // fetch all selected option for correctness
        // const optionIds = answers.map((a:any)=>a.selectedOptionId);

        // const selectedOptions = await Option.findAll({
        //     where : { id : optionIds }
        // })

        // const score = selectedOptions.reduce((acc,option)=>{
        //     return option.isCorrect ? acc + 1 : acc;
        // },0);

        // calculate score
        // fetch all questions with their marks and correct options
        const questionsIds = answers.map((a:any)=>a.questionId);

        // making available all questions with their options
        const questions = await Question.findAll({
            where : { id : questionsIds},
            include:[
                {
                    model : Option,
                }
            ]
        }) as QuestionWithOptions[];

        // calculate score based on question marks
        let totalScore = 0;
        for(const answer of answers){
            const question = questions.find(q => q.id === answer.questionId);
            if(!question) continue;

            // find the correct option for this question
            const correctOption = question.options?.find((opt: Option) => opt.isCorrect);;
            if(!correctOption) continue; // skip if no correct option found
            if(correctOption.id === answer.selectedOptionId){
                totalScore += question.marks;
            }
        }


        // update the submission with score and submitted timestamps
        const now = new Date();
        await submission.update({
            submittedAt: now,
            endedAt:now,
            score:totalScore,
            isScoreReleased: false //teacher can relase later
        })

        res.status(200).json({
            message : 'test submitted successfully',
            // data :{
            //     submissionId: submission.id,
            //     score: totalScore,
            //     submittedAt: now,
            //     endedAt: now
            // }
        })





    }

    // Get all submission for a test(for teachers)
    public static async getAllTestSubmissions(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        const { testId }= req.params;
        const {page=1,limit =10} = req.query;


        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            });
            return;
        }

        if(!['teacher','admin'].includes(req.user.role)){
            res.status(403).json({
                message: 'Only teachers and admins can view submissions'
            });
            return;
        }

        // Fetch submissions for the test
        const { count, rows } = await Submission.findAndCountAll({
            where: {
                testId,
            },
            limit: parseInt(limit as string),
            offset: (parseInt(page as string) - 1) * parseInt(limit as string),
            order: [['createdAt', 'DESC']],
            attributes:['id','score','submittedAt','startedAt','isScoreReleased','studentId'],
            include:[
                {
                    model:User,
                    as : 'student',
                    attributes:['id','username','email']
                }
            ]
        });

        res.status(200).json({
            message: 'Submissions fetched successfully',
            data: rows,
            meta: {
                total: count,
                page,
                totalPages: Math.ceil(count / parseInt(limit as string)),
                releasedCount : rows.filter(sub => sub.isScoreReleased).length,
                pendingCount : rows.filter(sub => !sub.isScoreReleased).length
            },
        });
    }

    // Release score both bulk and selective score release
    public static async releaseScores(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        const { testId, submissionIds } = req.body;

        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            });
            return;
        }

        if (!['teacher', 'admin'].includes(req.user.role)) {
            res.status(403).json({
                message: 'Only teachers and admins can release scores'
            });
            return;
        }

        if (!testId && (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0)) {
            res.status(400).json({
                message: 'Either testId (for bulk release) or submissionIds (for selective release) is required'
            });
            return;
        }

        // Op stands for Operators
        // [Op.ne] → means "not equal".
        // So this condition ensures we only update submissions that have actually been submitted, i.e., submittedAt != null.

        let whereCondition: any = {
            submittedAt: { [Op.ne]: null }, // only submitted ones
        };

        if (testId) {
          whereCondition.testId = testId;
        }

         if (submissionIds && submissionIds.length > 0) {
           whereCondition.id = { [Op.in]: submissionIds };
        }

        const [updatedCount] = await Submission.update(
            { isScoreReleased: true },
            { where: whereCondition }
        );

        if (updatedCount === 0) {
            res.status(404).json({ 
                message: "No matching submissions found" 
            });
            return;
        }

        res.status(200).json({
            message: `Scores released for ${updatedCount} submission(s)`,
        });
    }


    // Get Student's own test result
    public static async getStudentOwnResults(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        const {page=1,limit = 10} = req.query;
        if(!req.user){
            res.status(401).json({
                message : 'user not authenticated'
            })
            return;
        }

        if (req.user.role !== 'student') {
            res.status(403).json({
                message: 'Only students can view their results'
            });
            return;
        }

        const { count,rows} = await Submission.findAndCountAll({
            where: {
                studentId: req.user.id,
                isScoreReleased: true // only fetch released scores
            },
            limit: parseInt(limit as string),
            offset: (parseInt(page as string) - 1) * parseInt(limit as string),
            order: [['createdAt', 'DESC']],
            attributes:['id','score','submittedAt','startedAt','isScoreReleased','testId']
        })

        res.status(200).json({
            message : 'Student results fetched successfully',
            data: rows,
            meta: {
                total: count,
                page,
                totalPages: Math.ceil(count / parseInt(limit as string))
            }
        })



    }

    

}   

export default SubmissionController;