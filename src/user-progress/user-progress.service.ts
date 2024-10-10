import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
    async addUserProgress(request:Request,lessonId:string){
        const decoded = this.jwtService.verify(request.headers['authorization'].split(' ')[1],{ secret: process.env.SECRET_KEY });
        const userId = decoded.authId; 

        const existingProgress = await this.prisma.user_Progress.findFirst({
            where: {
              userId: userId,
              lessonId: lessonId,
              isCompleted: true
            }
          });
    
          // If the user has already completed the lesson, return
          if (existingProgress) {
            return {message:"Lesson is already completed"};
          }

          const userProgress = await this.prisma.user_Progress.create({
            data: {
              userId: userId,
              lessonId: lessonId,
              isCompleted: true
            }
          });
          if(!userProgress){
            throw new Error('error in adding new progress')
          }
          this.eventEmitter.emit('points.added',{userId:userId,points:100})
          return {message:"User Progress added successfully"};
    }

    async getUserProgressById(userId:string){
        try{
         
            const userProgress = await this.prisma.user_Progress.findMany({
                where:{
                    userId:userId
                }
            })
            if(!userProgress){
                throw new InternalServerErrorException('error in fetching user progress')
            }
            return userProgress;
        }catch(error){
            console.log(error)
            throw new InternalServerErrorException('error in fetching user progress')
        }
    }


}
 