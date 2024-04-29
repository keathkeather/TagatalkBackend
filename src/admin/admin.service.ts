import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { User } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
    constructor(private prisma:PrismaService,private authService:AuthService){}


    async getAllUsers(){
        try{
            return this.prisma.user.findMany()
        }catch(Error){
            throw Error('Failed to get all users')
        }
    }

    async getAllReports(){
        try{
            return this.prisma.report.findMany()
        }catch(Error){
            throw Error('Failed to get all reports')
        }
    }
    async getAllFeedbacks(){
        try{
            return this.prisma.feedback.findMany()
        }catch(Error){
            throw Error('Failed to get all feedbacks')
        }   
    }
    async banUserById(authId:string,date:number ){
        try{
            const bannedUntil = new Date();
            bannedUntil.setMonth(date);
            const user = await this.authService.getUserByID(authId);
            if (!user) {
                throw Error('User not found');
            }
            this.prisma.auth.update({
                where: {
                    authId: user.authId
                },
                data: {
                    banned_until: bannedUntil
                }
            });
            
        }catch(Error){
            throw Error('Failed to ban user')   
        }
    }
    async unBanUserById(authId:string){
        try{
            const user = await this.authService.getUserByID(authId)
            if(!user){
                throw Error('User not found')
            }
            this.prisma.auth.update({

                where: {
                    authId: user.authId
                },
                data: {
                    banned_until: null
                }
            });

            
        }catch(Error){
            throw Error('Failed to unban user')   
        }
    }
    async getAllBannedUsers():Promise<User[]|null>{
        try{
            return this.prisma.user.findMany({
                include: {
                  auth: true, // Include the related Auth model
                },
                where: {
                  auth: {
                    banned_until: {
                        not: null
                    }, // Filter based on the isBanned field in the Auth model
                  },
                },
              });
        }catch(Error){
            throw Error('Failed to get all banned users')
        }
    }
}
