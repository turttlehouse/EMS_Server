import { NextFunction, Response } from "express";
import { AuthRequest } from "../../middleware/auth/authTypes";
import sequelize from "../../database/connection";
import Question from "../../database/models/questionModel";
import Option from "../../database/models/optionModel";


class QuestionController{

    // create multiple question with their options in one request
    public static async createQuestions(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{

        const { testId , questions } = req.body;

        if(!testId || !Array.isArray(questions) || questions.length === 0){
            res.status(400).json({
                message: 'testId and questions are required'
            });
            return;
        }
        // creates a database transaction — a group of database operations that are treated as a single unit.
        // Within the transaction, you perform multiple queries (creating questions and options).
        // either all related database operations succeed, or none do.
        const transaction = await sequelize.transaction();

        const createdQuestions = [];

        for(const q of questions){
            const {questionText,options}=q;

            if(!questionText || !Array.isArray(options) || options.length === 0){
                await transaction.rollback();
                res.status(400).json({
                    message : 'each question must have a question text and options array'
                })
                return;
            }

            // create question
            const question = await Question.create({
                testId,
                questionText
            },{transaction})

            // create options
            const createdOptions = await Promise.all(
                options.map((opt:any)=>(
                    Option.create({
                        questionId : question.id,
                        optionLabel : opt.optionLabel,
                        optionText : opt.optionText,
                        // always stored as a proper boolean value in the database, regardless of what type of value is passed in the request
                        isCorrect : !!opt.isCorrect,
                    },{transaction})
                ))
            )

            // find correct option's id
            const correctOption = createdOptions.find((opt)=> opt.isCorrect);
            
            //Exactly Only one Correct option must exist
            if(!correctOption){
                // if no correct option marked then rollback
                await transaction.rollback();
                res.status(400).json({
                    message: 'each question must have one correct option'
                });
                return;
            }
            // only one correct option must exist
            const correctOptionsCount = createdOptions.filter(opt => opt.isCorrect).length;
            if(correctOptionsCount > 1){
                await transaction.rollback();
                res.status(400).json({
                    message: 'each question must have exactly one correct option'
                });
                return;
            }

            createdQuestions.push({
                question,
                options: createdOptions
            })


        }
        
        await transaction.commit();

        res.status(201).json({
            message: 'questions and its options created successfully',
            data: createdQuestions
        });



    }


}

export default QuestionController;









