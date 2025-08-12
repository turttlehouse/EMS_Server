import { Response,NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth/authTypes";
import Submission from "../../database/models/submissionModel";
import StudentAnswer from "../../database/models/studentAnswerModel";
import Option from "../../database/models/optionModel";
import Question from "../../database/models/questionModel";
import { Op } from "sequelize";


class SubmissionController{
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

        // 
        const questions = await Question.findAll({
            where : { id : questionsIds},
            include:[
                {
                    model : Option,
                    where : { id : {[Op.in] : answers.map((a:any)=>a.selectedOptionId)} }
                }
            ]
        })

        // calculate score based on question marks
        let totalScore = 0;
        for(const answer of answers){
            const question = questions.find(q => q.id === answer.questionId);
            if(!question) continue;

            // check if selected option is the correct one for this question
            const isCorrect = question.correctOptionId === answer.selectedOptionId;
            if(isCorrect){
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
            data :{
                submissionId: submission.id,
                score: totalScore,
                submittedAt: now,
                endedAt: now
            }
        })





    }

}   

export default SubmissionController;