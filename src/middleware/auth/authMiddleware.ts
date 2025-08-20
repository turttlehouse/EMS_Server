import { Response,NextFunction } from "express";
import jwt from 'jsonwebtoken';
import User from "../../database/models/userModel";
import { AuthRequest, Role } from "./authTypes";


class AuthMiddleware{

    async isAuthenticated(req:AuthRequest,res:Response,next:NextFunction):Promise<void>{
        // const token = req.headers.authorization;

        // if(!token || token== null || token=== undefined){
        //     res.status(403).json({
        //         message:'token not provided'
        //     })

        //     return
        // }
        const authHeader = req.headers.authorization;

        if(!authHeader || authHeader === null || authHeader === undefined){
            res.status(403).json({
                message:'token not provided'
            })
            return
        }
        
        // Extract token from "Bearer <token>" format
        let token;
        if(authHeader.startsWith('Bearer ')){
            token = authHeader.substring(7); // Remove "Bearer " prefix
        } else {
            token = authHeader; // Fallback for direct token
        }


        const secretKey = process.env.JWT_SECRET;

        if(!secretKey){
            res.status(500).json({
                message:'JWT secret key is not defined'
            })
        }

        // console.log(jwt)
        jwt.verify(token as string,secretKey as string,async(err:any,decoded:any)=>{
            if(err){
                res.status(403).json({
                    message : 'Invalid Token'
                })
                return
            }
            else{
                try {
                    const userData = await User.findByPk(decoded.id)
                    if(!userData){
                        res.status(404).json({
                            message : 'user not found with this token'
                        })
                        return
                    }
                    req.user = userData
                    next()
                    
                } catch (error) {
                    res.status(500).json({
                        message : 'Internal Server Error'
                    })
                    
                }
            }
        })



    }

    restrictTo(...roles:Role[]){
        return(req:AuthRequest,res:Response,next:NextFunction)=>{
            
            let userRole = req.user?.role as Role;

            if(!roles.includes(userRole)){
                res.status(403).json({
                    message : 'you dont have permission to perform this action'
                })
            }else{
                next()
            }

        }
    }
}

export default new AuthMiddleware();

