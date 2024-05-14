import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth, User } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
@Injectable()
export class UserService {
    constructor(private prisma:PrismaService, private authService:AuthService){}
    async getAllUser():Promise<User[]|null>{
        try{
            return this.prisma.user.findMany();
        }catch(Eror){
            throw new Error('failed to get all users')
        }
    }
    async getUserById(id:string):Promise<User|null>{
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    userId:id
                }
            })
            if(!user){
                return null
            }else{
                return user
            }
        }catch(Error){
            throw new Error('failed to get user by id')
        }
    }
    async getUserByEmail(email:string):Promise<User|null>{
        try{
            return this.prisma.user.findUnique({
                where:{
                    email:email
                }
            })
        }catch(Error){
            throw new Error('failed to get user by email')
        }
    }
    async addUserName(request:Request,username: string){
        try{
            console.log(username)
            const userEmail = (request.user as User).email;
            
            const user = await  this.authService.findByEmail(userEmail);
            console.log(user)
            return this.prisma.user.update({
                where:{
                    userId:user.authId
                },
                data:{
                    name:username
                }
            })
        } catch(error) {
            console.log(error.stack)
            throw new Error('Failed to create user name');
        }
    }
    async editUserProfile(request:Request,username:string, profilePic:string){
        
    }

}
