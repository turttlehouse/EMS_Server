import { Response } from "express";
import { AuthRequest } from "../../middleware/auth/authTypes";
import Test from "../../database/models/testModel";
import Submission from "../../database/models/submissionModel";
import Question from "../../database/models/questionModel";
import Option from "../../database/models/optionModel";


class TestController{

    //create Test method
    public static async createTest(req:AuthRequest,res:Response):Promise<void>{

        const {title,description,durationInMinutes,isPublished} = req.body;

        if(!title || !durationInMinutes){
            res.status(400).json({
                message: 'title and duration are required'
            })
            return
        }

         //user check since it's optional in the type
        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            })
            return
        }

        // only teacher and admin can create a test
        if(!['teacher','admin'].includes(req.user.role)) {
            res.status(403).json({
                message: 'only teachers and admin can create test'
            });
            return;
        }

        const test = await Test.create({
            title,
            description: description || '',
            durationInMinutes,
            createdBy: req.user.id, //from authenticated user
            isPublished
        })

        res.status(201).json({
            message : 'test created successfully',
            data : test
        })      

    }

    // get all tests method with filter
    public static async getAllTests(req:AuthRequest,res:Response):Promise<void>{
        const { isPublished,page=1,limit=10} = req.query;
        
        // sequelize automatically handles undefined values
        const {count,rows} = await Test.findAndCountAll({
            where:{
                // Only add isPublished if it's provided
                ...(isPublished !== undefined && { isPublished: isPublished === 'true' }),
                // For students: force published only
                ...(req.user?.role === 'student' && { isPublished: true })
            },
            limit : parseInt(limit as string),
            offset : (parseInt(page as string) - 1) * parseInt(limit as string),
            order: [['createdAt', 'DESC']]
        })

        res.status(200).json({
            message : 'tests fetched successfully',
            data : rows,
            meta: {
                total: count,
                page,
                totalPages: Math.ceil(count / parseInt(limit as string)),
            },
        })

    }

    // start test method
    public static async startTest(req:AuthRequest,res:Response):Promise<void>{
        const {id} = req.params;

        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            })
            return
        }

        // only students can start tests
        if(req.user.role !== 'student'){
            res.status(403).json({
                message : 'only students can start tests'
            })
            return
        }

        // check if text exists and is Published
        const test = await Test.findByPk(id);
        
        if(!test){
            res.status(404).json({
                message : 'test not found'
            })
            return;
        }

        if(!test?.isPublished){
            res.status(400).json({
                message : 'test is not published'
            })
            return;
        }

        // check if student has already started this test
        const existingSubmission = await Submission.findOne({
            where:{
                testId:id,
                studentId : req.user.id
            }
        })

        if(existingSubmission){
            //calculate remaining time if test was already started
            const startTime = new Date(existingSubmission.startedAt);
            const currentTime = new Date();
            const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
            const remainingMinutes = Math.max(0,test.durationInMinutes - elapsedMinutes);


            if(remainingMinutes <=0 && !existingSubmission.submittedAt ){
                // If time is up, submit the test automatically
                await Submission.update({
                    submittedAt: new Date(),
                }, {
                    where: {
                        id: existingSubmission.id
                    }
                })
            }

            res.status(200).json({
                message : 'test already started',
                data:{
                    submissionId: existingSubmission.id,
                    testId : test.id,
                    title : test.title,
                    description : test.description,
                    totalDurationInMinutes : test.durationInMinutes,
                    remainingMinutes: remainingMinutes,
                    startedAt : existingSubmission.startedAt,
                    endTime : new Date(startTime.getTime() + (test.durationInMinutes * 60 * 1000))
                }
            });
            return;
        
        }

        // create new Submission record
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (test.durationInMinutes * 60 * 1000)) //js work with miliseconds

        const submission = await Submission.create({
            testId:id,
            studentId:req.user.id,
            startedAt : startTime,
            submittedAt : null // only set when test is submitted
        })

        res.status(201).json({
            message : 'test started successfully',
            data : {
                submissionId : submission.id,
                testId:test.id,
                title : test.title,
                description : test.description,
                totalDurationInMinutes: test.durationInMinutes,
                remainingMinutes : test.durationInMinutes,
                startedAt : submission.startedAt,
                endTime : endTime
            }
        });

    }

    // Get Test questions
    public static async getTestQuestions(req:AuthRequest,res:Response):Promise<void>{
        const { id } = req.params;

        if(!req.user){
            res.status(401).json({
                message: 'User not authenticated'
            })
            return
        }
        // only student can get test questions
        if(req.user.role !== 'student'){
            res.status(403).json({
                message : 'only students can get test questions'
            })
            return
        }
        const test = await Test.findByPk(id);
        if(!test){
            res.status(404).json({
                message : 'test not found'
            })
            return;
        }
        if(!test?.isPublished){
            res.status(400).json({
                message : 'test is not published'
            })
            return;
        }
        // check if student has already started this test
        const submission = await Submission.findOne({
            where :{
                testId : id,
                studentId : req.user.id
            }
        })

        if(!submission){
            res.status(404).json({
                message : 'test not started yet'
            })
            return;
        }

        // check if time hasn't expired
        const startTime = new Date(submission.startedAt);
        const currentTime = new Date();
        const elapsedMinutes = Math.floor((currentTime.getTime() - startTime.getTime()) / (1000 * 60));
        const remainingMinutes = Math.max(0, test.durationInMinutes - elapsedMinutes);

        if(remainingMinutes <= 0 && !submission.submittedAt){
            // Auto-submit if time is up
            await Submission.update({
                submittedAt: new Date()
            }, {
                where: {
                    id: submission.id
                }
            });

            res.status(400).json({
                message : 'Test time has expired'
            })

            return;

        }

        // Get qusetions with their options
        const questions = await Question.findAll({
            where :{testId:id},
            include : [{
                model : Option,
                as : 'options',
                attributes:['id','optionText']
            }],
            attributes:['id','questionText'],
            order:[['createdAt','ASC']]
        })

        res.status(200).json({
            message : 'Test questions retrieved successfully',
            data : questions,
            meta:{
                submissionId:submission.id,
                remainingMinutes:remainingMinutes,
                totalQuestions : questions.length,
            }
        })

    }

}

export default TestController;