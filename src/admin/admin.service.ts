import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { User } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Injectable()
export class AdminService {
    constructor(private prisma:PrismaService,private authService:AuthService){}


    async getAllUsers():Promise<User[]|null>{
        try{
            return this.prisma.user.findMany({   
                where:{
                    isDeleted:false,
                    auth:{
                        banned_until:null
                    }
                }
            }
            )
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
    async banUserById(authId: string, months: number, days: number) {
        try {
            const now = new Date();
            const bannedUntil = new Date();
            bannedUntil.setMonth(bannedUntil.getMonth() + months);
            bannedUntil.setDate(bannedUntil.getDate() + days);
            const user = await this.authService.getUserByID(authId);
            if (!user) {
                throw new Error('User not found');
            }
        
          await this.prisma.auth.update({
            where: {
              authId: user.authId
            },
            data: {
              banned_until: bannedUntil
            }
          });
        } catch (err) {
            console.log(err.stack)
          throw new Error('Failed to ban user');
        }
      }
    async banUserIndefinitely(authId: string) {
            try {
                const bannedUntil = new Date(8640000000000000); 

                const user = await this.authService.getUserByID(authId);
                if (!user) {
                throw new Error('User not found');
                }

                await this.prisma.auth.update({
                where: {
                    authId: user.authId
                },
                data: {
                    banned_until: bannedUntil
                }
                });
            } catch (err) {
                throw new Error('Failed to ban user');
            }
        }
    async unBanUserById(authId:string){
        try{
            const user = await this.authService.getUserByID(authId)
            if(!user){
                throw Error('User not found')
            }
            await this.prisma.auth.update({

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
                where: {
                  isDeleted:false,

                  auth: {
                    banned_until: {
                        not:null
                    }
                  },
                },
              });
        }catch(Error){
            throw Error('Failed to get all banned users')
        }
    }
    async deleteReportById(reportId:string){
        try{
            return this.prisma.report.update({
                where:{
                    id:reportId
                },
                data:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to delete report')
        }
    }
    async deleteFeedbackById(feedbackId:string){
        try{
            return this.prisma.feedback.update({
                where:{
                    id:feedbackId
                },
                data:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to delete feedback')
        }
    }
    async deleteUserById(userId:string){
        try{
            return this.prisma.user.update({
                where:{
                    userId:userId
                },
                data:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to delete user')
        }
    }
    async deleteUserPermanently(userId:string){
        try{
            return this.prisma.user.delete({
                where:{
                    userId:userId
                }
            })
        }catch(Error){
            throw Error('Failed to delete user')
        }
    }
    async restoreDeletedUser(userId:string){
        try{
            const user = await this.prisma.user.findUnique({
                where:{
                    userId:userId
                }
        
            })
            if(!user){
                throw new NotFoundException('User not found')
            }
            return this.prisma.user.update({
                where:{
                    userId:user.userId
                },
                data:{
                    isDeleted:false
                }
            })
        }catch(Error){
            throw Error('Failed to restore user')
        }
    }
    async getAllDeletedUsers():Promise<User[]|null>{
        try{
            return this.prisma.user.findMany({
                where:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to get all deleted users')
        }
    }
    async getAllDeletedReports(){
        try{
            return this.prisma.report.findMany({
                where:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to get all deleted reports')
        }
    }
    async getAllDeletedFeedbacks(){
        try{
            return this.prisma.feedback.findMany({
                where:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to get all deleted feedbacks')
        }
    }
    async restoreDeletedReport(reportId:string){
        try{
            const report = await this.prisma.report.findUnique({
                where:{
                    id:reportId
                }
        
            })
            if(!report){
                throw new NotFoundException('Report not found')
            }
            return this.prisma.report.update({
                where:{
                    id:report.id
                },
                data:{
                    isDeleted:false
                }
            })
        }catch(Error){
            throw Error('Failed to restore report')
        }
    }
    async restoreDeletedFeedback(feedbackId:string){
        try{
            const feedback = await this.prisma.feedback.findUnique({
                where:{
                    id:feedbackId
                }
        
            })
            if(!feedback){
                throw new NotFoundException('Feedback not found')
            }
            return this.prisma.feedback.update({
                where:{
                    id:feedback.id
                },
                data:{
                    isDeleted:false
                }
            })
        }catch(Error){
            throw Error('Failed to restore feedback')
        }
    }

}
