import { Response,NextFunction } from "express";
import User from "../../database/models/userModel";
import { AuthRequest } from "../../middleware/auth/authTypes";

class UserController{

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

export default UserController;