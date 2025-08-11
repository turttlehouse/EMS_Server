import { Response,NextFunction } from "express";
import User from "../../database/models/userModel";
import { AuthRequest } from "../../middleware/auth/authTypes";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


class AuthController{

    //register user method
    public static async registerUser(req:AuthRequest,res:Response):Promise<void>{
        const {username,email,passwordHash,role} = req.body;

        if(!username || !email || !passwordHash || !role){
            res.status(400).json({
                message : "Please provide all fields"
            })
            return;
        }

        if(role && !['admin','teacher','student'].includes(role)){
            res.status(400).json({
                message : 'invalid role'
            })
        }

        const [user] = await User.findAll({
            where:{
                email : email
            }
        })

        if(user){
            res.status(400).json({
                message : 'user already exist'
            })
            return;
        }

        await User.create({
            username,
            email,
            role : role,
            passwordHash : bcrypt.hashSync(passwordHash,8)
        })

        res.status(200).json({
            message : 'user registered successfully'
        })

    }

    // login user method
    public static async loginUser(req:AuthRequest,res:Response):Promise<void>{
        const { email,passwordHash} = req.body;

        if(!email || !passwordHash){
            res.status(400).json({
                message : 'Please provide email and password'
            })
        }

        // check email existence
        const [data] = await User.findAll({
            where:{
                email:email
            }
        })

        if(!data){
            res.status(400).json({
                messag : 'user not found'
            })
        }

        // check passwordhash is correct or not
        const isMatch = bcrypt.compareSync(passwordHash, data?.passwordHash ?? "")

        if(!isMatch){
            res.status(400).json({
                message : 'invalid email or password'
            })
            return;
        }

        // generate token
        if(!process.env.JWT_SECRET){
            res.status(500).json({
                message : 'JWT secret is not defined'
            })
            return;
        }

        const token = jwt.sign({id:data?.id},process.env.JWT_SECRET,{expiresIn:'100d'});

        res.status(200).json({
            message : 'user logged in successfully',
            data : token
        })

    }

    // get all users
    public static async getUsers(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
       
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role']
        });
        
        if(users.length > 0){
            res.status(200).json({
                message : 'users fetched successfully',
                data : users
            })
            return;
        }
        else{
            res.status(200).json({
                message : 'users not found',
                data : []
            })
        }
        
    }

    // delete user
    public static async deleteUser(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        
        const id = req.params.id;

        const user = await User.findOne({
            where:{
                id: id
            }
        })

        if(!user){
            res.status(400).json({
                message : 'user not found'
            })
            return;
        }

        if(user.role === 'admin'){
            res.status(400).json({
                message : 'admin user cannot be deleted'
            })
        }

        await User.destroy({
            where : {
                id : id
            }
        })

        res.status(200).json({
            message : 'user deleted successfully'
        })
    }

    // update user role
    public static async updateUserRole(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        
        const id = req.params.id;
        const {role} = req.body;

        if(!role || !['admin','teacher','student'].includes(role)){
            res.status(400).json({
                message : 'please provide a valid role'
            })
            return;
        }

        const user = await User.findOne({
            where:{
                id: id
            }
        })

        if(!user){
            res.status(400).json({
                message : 'user not found'
            })
            return;
        }

        if(user.role === 'admin'){
            res.status(400).json({
                message : 'admin user cannot be updated'
            })
            return;
        }

        await User.update({role: role},{
            where : {
                id : id
            }
        })

        res.status(200).json({
            message : 'user role updated successfully'
        })
    }
}

export default AuthController;