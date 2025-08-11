import { Response } from "express";
import User from "../../database/models/userModel";
import { AuthRequest } from "../../middleware/auth/authTypes";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


class AuthController{

    //register user method
    public static async registerUser(req:AuthRequest,res:Response):Promise<void>{
        const {username,email,passwordHash,role ='student'} = req.body;

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
            return
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

}

export default AuthController;