import { Response } from "express";
import { AuthRequest } from "../../middleware/auth/authTypes";
import Test from "../../database/models/testModel";


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


}

export default TestController;