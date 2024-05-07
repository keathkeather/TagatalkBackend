import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { Auth, Feedback } from '@prisma/client';
import { feedbackDto } from './DTO/feedback.dto';
import { Request } from 'express';
@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) {}

    async createFeedback(request:Request,feedbackDto:feedbackDto){
        try{
            const userId = (request.user as Auth).authId;
            const { feedbackTitle, feedbackDescription } = feedbackDto;
            const newFeedback = await this.prisma.feedback.create({
                data:{
                    feedbackTitle: feedbackTitle,
                    feedbackDescription: feedbackDescription ,
                    userId:userId
                }
            })
            return newFeedback;

        }catch(Error){
            throw new Error('failed to create feedback')
        }
    }
    async getAllFeedback():Promise<Feedback[]|null>{
        try{
            return this.prisma.feedback.findMany(
                {
                    where:{
                        isDeleted:false
                    }
                }
            );
        }catch(Error){
            throw new Error('failed to get all feedback')
        }
    }


}
