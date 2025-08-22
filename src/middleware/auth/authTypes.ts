import { Request } from "express";

export interface AuthRequest extends Request{
    user?:{
        id: string;
        username: string;
        email:string;
        role: string;
        passwordHash?:string;
    }
}

export enum Role{
    Admin = 'admin',
    Teacher = 'teacher',
    Student = 'student'
}