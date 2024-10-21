import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth, User } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { Role } from '../enum/role.enum';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    constructor(private prisma:PrismaService,private authService:AuthService,private jwtService:JwtService){}


    async checkAdminRole(request:Request):Promise<boolean>{
        try{
            const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
            if(decoded.isSuperAdmin===false|| decoded.isSuperAdmin === null){
                return false;
            }
            return true;
        }catch(Error){
            console.log(Error.stack)
            throw new UnauthorizedException('You are not authorized to perform this action')
        }
    }

    async getAllUsers(request:Request):Promise<User[]|null>{
        try{
            
            if(await this.checkAdminRole(request)==true){
                console.log(await this.checkAdminRole(request))
                return this.prisma.user.findMany({   
                    where:{
                        isDeleted:false,
                        auth:{
                            banned_until:null,
                            role:Role.USER,
                            is_super_admin:false||null
                        }
                    },
                })    
            }else{
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
        }catch(Error){
            throw new UnauthorizedException('Failed to get all users')
        }
    }
    async  promoteUserToAdmin(userId: string):Promise<Auth|null>{
        try{
            return this.prisma.auth.update({
                where:{
                    authId: userId
                },
                data:{
                    role:Role.ADMIN,
                    is_super_admin:true
                }
            })
            
        }catch(Error){
            throw Error('failed to promote user')
        }
    }

    async getAllReports(request:Request){
        try{
            
            if(await this.checkAdminRole(request)){
                return this.prisma.report.findMany(
                    {
                        where:{
                            isDeleted:false,
                            user:{
                                isDeleted:false
                            }
                        },
                        include:{
                            user:{
                                select:{
                                    name:true,
                                    email:true
                                }
                            }
                        }
                    }
                )
            }
        }catch(Error){
            throw Error('Failed to get all reports')
        }
    }
    async getAllFeedbacks(request:Request){
        try{
            if(await this.checkAdminRole(request)===true){
                return this.prisma.feedback.findMany({
                    where:{
                        isDeleted:false,
                        user:{
                            isDeleted:false
                        }
                    },
                    include:{
                        user:{
                            select:{
                                name:true,
                                email:true
                            }
                        }
                    }
                    
                })
            }
        }catch(Error){
            throw Error('Failed to get all feedbacks')
        }   
    }
    async banUserById(authId: string, months: number, days: number,request:Request) {
        try {
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async banUserIndefinitely(authId: string,request:Request) {
            try {
                if(await this.checkAdminRole(request)==false){
                    throw new UnauthorizedException('You are not authorized to perform this action')
                }
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
    async unBanUserById(authId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async getAllBannedUsers(request:Request):Promise<User[]|null>{
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            return this.prisma.user.findMany({
                where: {
                  isDeleted:false,

                  auth: {
                    banned_until: {
                        not:null
                    }
                  },
                },
                include:{
                    auth:{
                        select:{
                            banned_until:true
                        }
                    }
                }
              });
        }catch(Error){
            throw Error('Failed to get all banned users')
        }
    }
    async deleteReportById(reportId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async deleteFeedbackById(feedbackId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async deleteUserById(userId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async deleteUserPermanently(userId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            return this.prisma.user.delete({
                where:{
                    userId:userId
                }
            })
        }catch(Error){
            throw Error('Failed to delete user')
        }
    }
    async restoreDeletedUser(userId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async getAllDeletedUsers(request:Request):Promise<User[]|null>{
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            return this.prisma.user.findMany({
                where:{
                    isDeleted:true,
                }
            })
        }catch(Error){
            throw Error('Failed to get all deleted users')
        }
    }
    async getAllDeletedReports(request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            return this.prisma.report.findMany({
                where:{
                    isDeleted:true
                }
            })
        }catch(Error){
            throw Error('Failed to get all deleted reports')
        }
    }
    async getAllDeletedFeedbacks(request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            return this.prisma.feedback.findMany({
                where:{
                    isDeleted:true
                }
            })
        }catch(Error){
            console.log(Error.stack)
            throw Error('Failed to get all deleted feedbacks')
        }
    }
    async restoreDeletedReport(reportId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async restoreDeletedFeedback(feedbackId:string,request:Request){
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
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
    async handleUserUnban(request:Request) {
        try{
            if(await this.checkAdminRole(request)==false){
                throw new UnauthorizedException('You are not authorized to perform this action')
            }
            const currentDate = new Date();
            const users = await this.prisma.auth.findMany({
                where: {
                    banned_until: {
                        lte: currentDate
                    }
                }
            });
        
            const unbanPromises = users.map(user => this.prisma.auth.update({
                where: {
                    authId: user.authId
                },
                data: {
                    banned_until: null
                }
            }));
        
            await Promise.all(unbanPromises);
        }catch(Error){
            console.log(Error)
            throw Error;
        }
    }
    async addLoginSummmary(periodType: 'DAY' | 'WEEK' | 'MONTH', periodStart:Date,periodEnd:Date, loginCount:number,){
        await this.prisma.loginSummary.create({
            data:{
                periodType:periodType,
                loginCount:loginCount,
                periodStart:periodStart,
                periodEnd:periodEnd
            }
        })
    }



    async createLoginSummary(periodType: 'DAY' | 'WEEK' | 'MONTH') {
        const now = new Date();
        let periodStart: Date;
        let periodEnd: Date;
    
        //* Calculate periodStart based on the period type
        switch (periodType) {
            case 'DAY':
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //* Midnight of today
                periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); //* End of today
                break;
            case 'WEEK':
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                periodStart.setDate(now.getDate() - 7); // 7 days ago
                periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); //* End of today
                break;
            case 'MONTH':
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                periodStart.setMonth(now.getMonth() - 1); // 1 month ago
                periodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); //* End of today
                break;
            default:
                throw new Error('Invalid period type');
        }
    
        const loginCount = await this.prisma.user.count({
            where: {
                lastLogin: {
                    gte: periodStart,
                    lte: periodEnd,
                },
                isAdmin:false,
            },
        });
    
        await this.addLoginSummary(periodType, periodStart, periodEnd, loginCount);
    }
    
    async addLoginSummary(periodType: 'DAY' | 'WEEK' | 'MONTH', periodStart: Date, periodEnd: Date, loginCount: number) {
        await this.prisma.loginSummary.create({
            data: {
                periodType,
                periodStart,
                periodEnd,
                loginCount,
            },
        });
    }
    async getLoginSummary(periodType: 'DAY' | 'WEEK' | 'MONTH') {
        return this.prisma.loginSummary.findMany({
          where: {
            periodType: periodType, // Filter by period type
          },
          orderBy: {
            periodStart: 'asc', // Order by period start for chronological graphing
          },
          select: {
            periodStart: true,
            loginCount: true,
          },
          take:30
        });
      }
      async createProgressSummary() {
        const now = new Date();
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        const endOfWeek = new Date(currentDate);

        // Set the start of the week to Sunday (or Monday based on your preference)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0); // Start of the day
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week
        endOfWeek.setHours(23, 59, 59, 999); // End of the day
        
        try{
            const progressCount = await this.prisma.user_Progress.count({
                where: {
                    isCompleted:true,
                    updatedAt:{
                        gte:startOfWeek,
                        lte:endOfWeek
                    }
                },
            });
            console.log(progressCount)
            await this.addProgressSummary(currentDate, progressCount);
            return { userCount: progressCount };

        }catch(Error ){
            console.log(Error)
            throw new Error('failed to get progress count')
        }
       
    }
    async addProgressSummary(date: Date, progressCount: number) {
        await this.prisma.progressSummary.create({
            data: {
                date,
                progressCount,
            },
        });
    }
    async getProgressSummary() {
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        const endOfWeek = new Date(currentDate);
    
        // Calculate the start and end of the week
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0); // Start of the day
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week
        endOfWeek.setHours(23, 59, 59, 999); // End of the day
    
        return this.prisma.progressSummary.findMany({
            where: {
                date: {
                    gte: startOfWeek,
                    lte: endOfWeek,
                },
            },
            orderBy: {
                date: 'asc',
            },
            select: {
                date: true,
                progressCount: true,
            },
        });
    }
    async getWeeklyProgressCountPerSkill(): Promise<{ [skillName: string]: { progressCount: number } }> {
        const skills = ['READING', 'WRITING', 'LISTENING', 'SPEAKING'];
        const progressCounts = {};
    
        const currentDate = new Date();
        const startOfWeek = new Date(currentDate);
        const endOfWeek = new Date(currentDate);
    
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); //* Sunday
        startOfWeek.setHours(0, 0, 0, 0); //* Start of the day
        endOfWeek.setDate(startOfWeek.getDate() + 6); //* End of the week
        endOfWeek.setHours(23, 59, 59, 999); //* End of the day
    
        for (const skill of skills) {
          const completedCount = await this.prisma.user_Progress.count({
            where: {
              lesson: {
                unit: {
                    skill:{
                        skillName:skill
                    },
                },
              },
              isCompleted: true,
              updatedAt: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          });
    
          progressCounts[skill] = { progressCount: completedCount };
        }
    
        return progressCounts;
      }
    
}

